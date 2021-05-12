import ClientOauth2 from 'client-oauth2';

export default class Auth {



  static authClient = new ClientOauth2({
    clientId: 'YbgnUMP0pz70Sfqg0R4zzaleF7Ya',
    clientSecret: 'BeLbbV7lNXBXlE9Y0tiW35poefka',
    accessTokenUri: 'https://auth.geoid.no/oauth2/token',
    authorizationUri: 'https://auth.geoid.no/oauth2/authorize',
    redirectUri: '/',
    scopes: []
  });

  static login = async (uname: string, pass: string): Promise<any> => {

    //check if BAAT user exist and has any roles.
    //If the user has no roles, we abort further authentication

    const result = await Auth.getBAATuser(uname);

    if (Object.keys(result.services).length > 0) {
      try {
        await Auth.authenticate(uname, pass);
      } catch(err) {
        console.log(err)
        const errorMsg = "Feil passord"
        console.log(errorMsg)
        return errorMsg
      }
      return undefined;
    } else {
      const errorMsg = 'Feil brukernavn / BAAT bruker har ikke tilstrekkelig roller';
      console.log(errorMsg);
      return errorMsg;
    }

  };

  static authenticate = async (uname: string, pass: string) => {
    try {
      let authResult = await  Auth.authClient.owner.getToken(uname, pass);
      Auth.setSession(authResult);
      console.log(authResult)
      location.href = '/';
    } catch (error) {
      console.log('ERROR: Innlogging feilet. ' + error);
      throw error
    }
  };

  static getBAATuser = async (uname: string) => {
    // Get the user from BAAT registry.
    const response = await fetch('https://baat.geonorge.no/authzapi/test/authzlist/' + uname, {
      method: 'get',
      headers: new Headers({
        'Authorization': 'Basic ' + btoa('baat:Baat4Ever?')
      })
    });
    return await response.json();

  };

  static logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('remember_me')
    location.href = '/login';
  };

  static setSession = (authResult) => {
    let expiresAt = JSON.stringify((authResult.data.expires_in * 60000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.data.access_token);
    localStorage.setItem('refresh_token', authResult.data.refresh_token);
    localStorage.setItem('expires_at', expiresAt);
  };

  static isAuthenticated = () => {
    let remembered = localStorage.getItem('remember_me');
    // Check if the current time stamp is past access token's expiry time stamp
    let expiresAt = Number(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt || (new Date().getTime() > expiresAt && remembered === "true");
  };

}
