#!/usr/bin/env node

const { cli } = require('cli-ux');
const AWS = require('aws-sdk');
const {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails
} = require('amazon-cognito-identity-js');

(async () => {
  const COGNITO_AGENT_USERNAME = process.env.COGNITO_AGENT_USERNAME || await cli.prompt('Username');
  const COGNITO_AGENT_PASSWORD = process.env.COGNITO_AGENT_PASSWORD || await cli.prompt('Password', { type: 'hide' });
  const COGNITO_AGENT_USERPOOL_ID = process.env.COGNITO_AGENT_USERPOOL_ID || await cli.prompt('UserPoolId');
  const COGNITO_AGENT_CLIENT_ID = process.env.COGNITO_AGENT_CLIENT_ID || await cli.prompt('ClientId');
  const COGNITO_AGENT_IDENTITYPOOL_ID = process.env.COGNITO_AGENT_IDENTITYPOOL_ID || await cli.prompt('IdentityPoolId');
  const COGNITO_AGENT_REGION = COGNITO_AGENT_IDENTITYPOOL_ID.split(':')[0];

  const authenticationDetails = new AuthenticationDetails(
    {
      Username: COGNITO_AGENT_USERNAME,
      Password: COGNITO_AGENT_PASSWORD
    }
  );
  const cognitoUser = new CognitoUser({
    Username: COGNITO_AGENT_USERNAME,
    Pool: new CognitoUserPool({
      UserPoolId: COGNITO_AGENT_USERPOOL_ID,
      ClientId: COGNITO_AGENT_CLIENT_ID
    })
  });

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      AWS.config.region = COGNITO_AGENT_REGION;

      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: COGNITO_AGENT_IDENTITYPOOL_ID,
        Logins: {
          [`cognito-idp.${COGNITO_AGENT_REGION}.amazonaws.com/${COGNITO_AGENT_USERPOOL_ID}`]: result.getIdToken().getJwtToken()
        }
      });

      AWS.config.credentials.refresh( error => {
        if (error) {
          console.error(error);
          process.exit(1);
        } else {
          console.log(`AWS_DEFAULT_REGION=${AWS.config.region}; export AWS_DEFAULT_REGION;`);
          console.log(`AWS_ACCESS_KEY_ID=${AWS.config.credentials.accessKeyId}; export AWS_ACCESS_KEY_ID;`);
          console.log(`AWS_SECRET_ACCESS_KEY=${AWS.config.credentials.secretAccessKey}; export AWS_SECRET_ACCESS_KEY;`);
          console.log(`AWS_SESSION_TOKEN=${AWS.config.credentials.sessionToken}; export AWS_SESSION_TOKEN;`);
        }
      });
    },
    onFailure: function (err) {
      console.error(err.message || JSON.stringify(err));
      process.exit(1);
    }
  });
})();
