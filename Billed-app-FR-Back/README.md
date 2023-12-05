# Billapp backend

## How to launch the API locally

### Clone the project
```
git clone https://github.com/FischKevin/DA-JS-Projet09.git
```

### Use a compatible version of node

If you are using a recent version of node on your computer, you may encounter errors when installing certain dependencies. Therefore, it's important to ensure that you have a compatible version of node, such as node v16 or v18.

Here are some tips for managing node versions on your computer:

#### On Windows
* Install NVM for Windows (https://github.com/coreybutler/nvm-windows/tags)
* Change the node version to a compatible one (for example, 18.16.1). Follow the instructions for NVM for Windows:

``` nvm install 18.16.1 ```

``` nvm use 18.16.1 ```
* Open PowerShell in administrator mode
* Enter the command ``` Set-ExecutionPolicy RemoteSigned ``` to manage script execution in PowerShell
* Close all terminal instances
* Enter the command npm install -g win-node-env to install node environment variable management for Windows
#### On Mac
* Install NVM (Node Version Manager) - https://github.com/nvm-sh/nvm
* Change the node version to a compatible one (for example, 18.16.1). Follow the instructions for NVM:

  ``` nvm install 18.16.1```
  
  ``` nvm use 18.16.1```
        
### Access the project directory
```
cd Billed-app-FR-Back
```

### Install project dependencies

```npm install```

### Launch the AP


```npm run run:dev```

### Access the API

The API is accessible on local port 5678, i.e., http://localhost:5678

### Default users
Administrator:

    Username: admin@test.tld
    Password: admin

Employee:

    Username: employee@test.tld
    Password: employee
