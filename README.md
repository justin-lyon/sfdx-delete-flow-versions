# sfdx-delete-flow-versions

Node JS CLI app that deletes Inactive Flows from a target Salesforce environment. Flows for each execution are stored in `data/obsolete-flows.json`.

# setup

```sh
git clone <repo url.git>

cd sfdx-delete-flow-versions

npm install

# Do not forget the double hyphen between npm start and the options.
npm start -- --username=targetenvusername --checkonly
```

# options

|   | Name | Required | Description |
|---|---|---|---|
| 1 | -u, --username | Yes | The sfdx username for the target environment. It should be visible locally on your machine using `sfdx force:org:list` |
| 2 | -c, --checkonly | No | Get a list of all obsolete Flows without deleting them. |

# sample stdout

```sh
$ npm start -- -u myusername
> sfdx-delete-flow-versions@1.0.0 start
> node src "-u" "myusername"

config { username: 'myusername', checkonly: undefined }
Username received. Searching local force:org:list for:  myusername
Username confirmed. Proceeding...
flow count 2
deleting:  3017d000000EmRcAAK
done Successfully deleted record: 3017d000000EmRcAAK.

deleting:  3017d000000EmRhAAK
done Successfully deleted record: 3017d000000EmRhAAK.
```