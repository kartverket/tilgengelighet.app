import stripBom from 'strip-bom';
import { find } from 'lodash';
import * as fs from 'fs';
import {
  FeatureComplexNode,
  FeatureMember,
  FeatureNode,
} from 'app/model/FeatureMember';
import { featureGroup } from 'leaflet';

interface SosiFile {
  version: '4.5';
  region: {};
  objects: ReadonlyArray<SosiObject>;
}

export interface SosiObject extends SosiNode {
  gatelangsParkering: string;
  avgift: string;
  merket: string;
  readonly OBJTYPE: string;
}

export function parseSosiFile(content: any): SosiFile {
  // TODO: Handle charset

  content = stripBom(content);

  let nodes = parseSosiFileToNodes(content);

  nodes[2].children.forEach(c => console.log(c));

  const features = sosiNodeToFeatureMember(nodes[2]);
  // nodes.map(node => sosiNodeToFeatureMember(node));
  return {} as SosiFile;
}

// TODO: Figure if an object structure is beneficial
export interface SosiNode {
  readonly name: string;

  readonly value?: string;
  readonly children: Array<SosiNode>;

  withChild(name: string, value: string): SosiNode;

  getChild(sosiName: string): SosiNode | undefined;

  // Generates SOSI formatted string
  toString(depth?: number): string;
}

const dotFilter = new RegExp('[^.+]');

function getNumberOfDots(line: string) {
  let number = 0;

  for (var i = 0; i < line.length; i++) {
    const charCode = line.charCodeAt(i);

    if (charCode === 46) {
      number++;
    } else {
      break;
    }
  }

  return number;
}

export function parseSosiFileToNodes(content: string): ReadonlyArray<SosiNode> {
  const lines = content.split('\n');

  const contextNode: SosiNodeImpl[] = [];
  const nodes: SosiNodeImpl[] = [];
  let depth = -1;

  for (let line of lines) {
    const numberOfDots = getNumberOfDots(line);

    if (numberOfDots === 0) {
      const node = contextNode[depth - 1];

      if (node.value === undefined) node.value = '';

      node.value += '\n' + line;
      continue;
    }

    const space = line.indexOf(' ');
    const name = line.substring(numberOfDots, space !== -1 ? space : undefined);
    const value = space !== -1 ? line.substr(space + 1) : undefined;

    const node = new SosiNodeImpl(name, value);

    contextNode[numberOfDots - 1] = node;

    if (numberOfDots === 1) nodes.push(node);
    else contextNode[numberOfDots - 2].children.push(node);

    depth = numberOfDots;
  }

  return nodes;
}

class SosiNodeImpl implements SosiNode {
  children: SosiNode[] = [];
  name: string;
  value?: string;

  constructor(name: string, value?: string) {
    this.name = name;
    this.value = value;
  }

  toString(depth?: number): string {
    if (depth === undefined) depth = 0;

    let string = '';

    function printDots(depth: number) {
      for (let i = 0; i <= depth; i++) {
        string += '.';
      }
    }

    printDots(depth);

    string += this.name;

    if (this.value !== undefined) {
      string += ' ' + this.value;
    }

    for (let child of this.children) {
      string += '\n';
      string += child.toString(depth + 1);
    }

    return string;
  }

  withChild(name: string, value: string): SosiNode {
    const newNode = new SosiNodeImpl(this.name, this.value);
    newNode.children = this.children.filter(child => child.name !== name);
    newNode.children.push(new SosiNodeImpl(name, value));
    return newNode;
  }

  getChild(sosiName: string): SosiNode | undefined {
    return find(this.children, child => child.name === sosiName);
  }
}

function sosiNodeToFeatureMember(sosiNode: SosiNode): FeatureMember {
  const feature = new FeatureMember();

  for (var i = 0; i < sosiNode.children.length; i++) {
    const node: SosiNode = sosiNode.children[i];

    if (node == undefined || node.name == undefined) {
      continue;
    }

    if (node.name == 'OBJTYPE') {
      console.log(node.name);

      feature.type = node.value;
      delete sosiNode.children[i];
      continue;
    }

    if (node.name == 'IDENT') {
      const idNodes: FeatureNode[] = [];
      for (const child of node.children) {
        idNodes.push(new FeatureNode(child.name, child.value, true));
      }
      feature.id = new FeatureComplexNode('identifikasjon', idNodes, true);
      console.log(node.name);
      delete sosiNode.children[i];

      continue;
    }

    if (node.name.includes('Ø')) {
      console.log(node.name);
      const coordsAsString = node.value!.split(' ');

      console.log(coordsAsString.length);
      const coordsSpliced = coordsAsString.slice(0, coordsAsString.length - 3);

      console.log(coordsSpliced);
      delete sosiNode.children[i];

      continue;
    }
  }

  return feature;
}
