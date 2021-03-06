# Futarchy App

App for futarchy

## Setup

1. `npm install`

2. `npm run compile`

## Run

1. `npm run start:app`: builds the frontend to `dist/`

2. `npm run devchain`: starts a local aragon [devchain](https://hack.aragon.org/docs/cli-usage.html#aragon-devchain)

3. `npm run start:aragon`:
  * deploys contract dependencies
  * publishes the futarchy app
  * creates a new futarchy DAO instance
  * starts the aragon app

## Scripts

### Seeding data

Seeding scripts in `scripts/seed_data` can be used to seed the UI with decisions and market trades.

To run the scripts, first run through the "Run" instructions above. Make sure all processes have succeeded and are running. Then:

1. Copy the DAO address from the URL of the app. This can be found in the `npm run start:aragon` output:

```
Open DAO [completed]
 ℹ You are now ready to open your app in Aragon.

 ℹ This is the configuration for your development deployment:
    Ethereum Node: ws://localhost:8545
    ENS registry: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1
    APM registry: aragonpm.eth
    DAO address: 0x5b48408a77645bd31e5eBaa460E84B588eaae1d4

    Opening http://localhost:3000/#/0x5b48408a77645bd31e5eBaa460E84B588eaae1d4 to view your DAO
```

2. Run `npm run seed <DAO_ADDRESS>`. Replace `<DAO_ADDRESS>` with your copied address

When these succeed, you will see 3 decisions in the UI. If you click on the first decision, you will see a series of trades.

To run a specific seed file, use `npm run seed <DAO_ADDRESS> [DATA_FILE_ID]`. The file ID can be found in the file name `scripts/data/data_<DATA_FILE_ID>.json`. If no ID is specified, the seed script defaults to running with the `scripts/data/data_0.json` file.

### `npm run devchain:reset`

Starts the devchain with `--reset`, which deletes existing ganache snapshots

**NOTE: aragon caches event data using indexdb. You need to clear your browser cache after the devchain is reset

## Debug Mode

Run `npm run start:app:debug` (instead of `npm run start:app`) to log all activity in the client. This will log info about all Aragon smart contract events, calls, and transactions.

## Sandbox Setup (for Component UI development)

Use this to develop components without having to depend on the "backend" smart contract environment:

1. First, `npm install`

2. Run `npm run start:app` to build the frontend to the `dist` dir and watch for changes.

3. Run `npm run start:sandbox` to serve the frontend at `http://localhost:8080`

4. Modify `./app/components/DecisionListEmptyState.js` to add the component you're working on. This is the default view, so you should see changes here when you refresh the browser.

If something breaks, just restart the `npm run start:app` and `npm run start:sandbox` processes.

## Mocking Component State

All components in `futarchy-app` are "stateless functional" components. This means they expect some state as input, and render UI based on this state. You can use hardcoded state to test these components. Here's an example:

```
// ./app/components/DecisionListEmptyState.js

import React from 'react'
// import ShowPanelButtonContainer from '../containers/ShowPanelButtonContainer'
import DecisionSummary from './DecisionSummary'

const mockDecision = {
  id: 123456,
  question: 'question will show up?'
}

const DecisionListEmptyState = () => (
  <DecisionSummary decision={mockDecision} />
  // <div>
  //   Nothing here yet...
  //   <br /> <br />

  //   <ShowPanelButtonContainer panelName="createDecisionMarket">
  //     New Decision
  //   </ShowPanelButtonContainer>
  // </div>
)

export default DecisionListEmptyState
```

This should display the `DecisionSummary` component with the state that we provided in `mockDecision`.

## Styling

We're using react [styled-components](https://www.styled-components.com/docs/basics), which allow you to add CSS within the component .js files. See `./app/components/AppHeader.js` for a good example of this.

## Publishing

Before publishing, make sure a local IPFS instance is running: `npm run ipfs`

### `npm run deploy:staging:prepare`:

Deploys these dependency contracts to staging (rinkeby). Allocates balances for the `MiniMeToken` to the accounts in `accounts.rinkeby.json`.

Deployed contract addresses and token allocation amounts will be stored in `deploy.rinkeby.json`.

### `npm run deploy:staging:publish:major`:

Publishes a new "major" version of the Futarchy app to staging (rinkeby).

### `npm run deploy:staging:publish:minor`:

Publishes a new "minor" version of the Futarchy app to staging (rinkeby).

## IPFS Propagation

The contents of the `dist` directory need to be propagated to IPFS in order for the web app to load on Aragon. To ensure that content is propagated:

* Make sure IPFS is running: `npm run ipfs`
* Run `npm run versions:staging`. Copy the IPFS hash of the version you want to propagate
* Run `npm run ipfs:propagate <ipfs_hash>` which will attempt to propagate all contents of this repo
* Run `npm run ipfs:propagate:dist <ipfs_hash>` to propagate the `dist` directory contents

To manually send to another node, an archive file of IPFS content can be generated by running `npm run ipfs:archive:<environment> <version> <ipfs_hash>`

## Deploying a Futarchy DAO

Before deploying, make sure a local IPFS instance is running: `npm run ipfs`

### `deploy:staging:newFutarchyDAO`

Deploys a new DAO on staging (rinkeby), installs on instance of the futarchy app `futarchy.open.aragonpm.eth`, and sets permissions for the deployer account.
