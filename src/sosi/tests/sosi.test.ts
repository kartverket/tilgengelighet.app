import * as fs from 'fs';
import { parseSosiFile } from '../sosi';

describe('SOSI', function () {
  describe('SOSI Parsing', function () {
    it('Sosi parsing', async function () {
      const file = fs.readFileSync(
        '/home/ulrik/CodeProjects/netpowerweb-custom-kartverket-pwa-f45bab79a95d/src/sosi/befolkning.trondheim.test.sos',
        'utf8',
      );
      const sosi = parseSosiFile(file);
      console.log(sosi);
    });

    // Parse file
    //
  });
});
