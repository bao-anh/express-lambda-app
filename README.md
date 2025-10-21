# Express on Lambda with CodeCommit CI/CD

This project bootstraps an [Express](https://expressjs.com/) API that runs on AWS Lambda and exposes routes through Amazon API Gateway. It ships with an AWS SAM template for deployment, an AWS CodeBuild build specification, and a CloudFormation template that provisions a CodeCommit-driven CI/CD pipeline.

## Guide
- Guild to setup Lambda with Code pipeline
https://www.youtube.com/watch?v=6SSLBfOZOtQ

## Prerequisites

- Node.js 18+
- AWS CLI v2 configured with credentials and default region
- (Optional) AWS SAM CLI for local Lambda emulation

## Install & Develop Locally

```bash
npm install
npm run dev
```

- `npm run dev` boots the Express server with hot reload via `nodemon`.
- Visit `http://localhost:3000/` for the welcome route or `http://localhost:3000/health` for the health check.

## Test

```bash
npm test
```

The test suite uses Node's built-in test runner together with `supertest`.

## Deploy Manually with SAM

Package and deploy the Lambda/API Gateway stack with the SAM CLI:

```bash
sam build
sam deploy --guided \
  --stack-name express-lambda-app \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides CodeAssetUri=.
```

The stack exports the API endpoint URL as the `ApiUrl` output.

## Set Up AWS CodeCommit

```bash
aws codecommit create-repository --repository-name express-lambda-app
git remote add codecommit https://git-codecommit.${AWS_REGION}.amazonaws.com/v1/repos/express-lambda-app
git push codecommit main
```

Replace `${AWS_REGION}` with your target AWS region code.

## Provision the CI/CD Pipeline

The CloudFormation template in `infra/pipeline.yaml` creates:

- CodeCommit repository (delete or comment this resource out if you plan to reference an existing repo).
- S3 buckets for pipeline artifacts and packaged Lambda assets.
- CodeBuild project that runs `buildspec.yml` (`npm install`, tests, SAM build/package).
- CodePipeline with Source → Build → Deploy stages.
- IAM roles for CodeBuild, CodePipeline, and CloudFormation deployment.

Deploy the pipeline template (replace the parameter values as needed):

```bash
aws cloudformation deploy \
  --template-file infra/pipeline.yaml \
  --stack-name express-lambda-ci \
  --capabilities CAPABILITY_NAMED_IAM
```

Once the stack completes, pushing to the `main` branch of the CodeCommit repository triggers the pipeline, builds the app, packages the Lambda with SAM, and updates the target CloudFormation stack defined by the `DeployStackName` parameter.

> **Note:** The application stack created from `template.yaml` now accepts a `CodeAssetUri` parameter. Leave it at the default (`.`) when deploying with the SAM CLI; set it to the S3 URI of the packaged artifact (for example, `s3://my-bucket/express-lambda-app.zip`) when deploying the template directly through CloudFormation or CodePipeline without running `sam package`.

## Local Lambda Emulation

Use the SAM CLI to invoke the Lambda locally with API Gateway emulation:

```bash
sam local start-api
```

SAM reads the same `template.yaml` used in deployment, so the behavior matches production closely.

## Project Structure

- `src/` – Express app entry point and routes.
- `lambda.js` – AWS Lambda handler that wraps the Express app with `@vendia/serverless-express`.
- `server.js` – Local development server.
- `template.yaml` – AWS SAM template.
- `buildspec.yml` – CodeBuild steps for CI.
- `infra/pipeline.yaml` – CloudFormation template for the CI/CD pipeline.
- `test/` – Node test runner specs.

## Next Steps

- Wire the repository into your preferred secrets management solution for environment variables (e.g., AWS Systems Manager Parameter Store).
- Extend the Express routes and add integration tests as you evolve the API.
