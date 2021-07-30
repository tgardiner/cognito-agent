# cognito-agent
Authenticate with AWS Cognito and retreive credentials to use in your environment

## Usecase

Testing authenticated API Gateway endpoints can be hard.  cognito-agent can be paired with [awscurl](https://github.com/okigan/awscurl/) to test API Gateway endpoints that use IAM authorization.

Example:

```bash
tom@MacBook ~ curl https://alfgjvvi136.execute-api.us-east-1.amazonaws.com/dev/v1/pets
{"message":"Missing Authentication Token"}

tom@MacBook ~ eval "$(cognito-agent)"
tom@MacBook ~ awscurl https://alfgjvvi136.execute-api.us-east-1.amazonaws.com/dev/v1/pets
{ id: 1, name: max, type: dog}
```

## Installation

```bash
npm i -g cognito-agent
```

## Configuration

cognito-agent can only be configured using environment variables.  If any config is missing, you will be prompted at runtime to enter the missing values.

### Environment Variables

| Variable                      | Description                 |
| ----------------------------- | --------------------------- |
| COGNITO_AGENT_USERNAME        | Cognito User Pool Username  |
| COGNITO_AGENT_PASSWORD        | Cognito User Pool Password  |
| COGNITO_AGENT_USERPOOL_ID     | Cognito User Pool Id        |
| COGNITO_AGENT_CLIENT_ID       | Cogntio User Pool Client Id |
| COGNITO_AGENT_IDENTITYPOOL_ID | Cognito Identity Pool Id    |

### Cli prompts at runtime

cognito-agent will prompt for any variable not found at runtime.

For exampe, you may wish to provide the username/password on the cli interactively:

```bash
tom@MacBook ~ cognito-agent
Username: tom@example.org
Password: ********

AWS_DEFAULT_REGION=us-east-1; export AWS_DEFAULT_REGION;
AWS_ACCESS_KEY_ID=ASIAZV...; export AWS_ACCESS_KEY_ID;
AWS_SECRET_ACCESS_KEY=hIrXEJI13k...; export AWS_SECRET_ACCESS_KEY;
AWS_SESSION_TOKEN=IQoJb3JpZ...; export AWS_SESSION_TOKEN;
```

## How it works

cognito-agent will log-in to the Cognito User Pool and then request a set of temporary credentials from the Cognito Identity Pool.  It spits out these credentials ready to be exported, much like ssh-agent.  You should use `eval "${cognito-agent}"` to avoid having the credentials appear in bash history and instead have them persisted into the environment ready to be used with subsequent commands, (either with `awscurl` or the normal `aws` cli).
