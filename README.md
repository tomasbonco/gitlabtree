GitLab code tree view
=====================

## !! Important: Future of this project
Since November's update of GitLab (11.4.5?), GitLab delivers similar functionality as this extension. That is awesome! But we no longer need this extension :(. Currently it isn't working (as DOM has changed, and I haven't reflected changes), but in short future, I will get rid of the most of the code and will try to enhance new GitLab's solution. I'm removing download links, as I think the extension is no longer beneficial for new users.

This is browser extension for Chrome / Firefox / Opera (and maybe IE as well :) ) that provides tree view for code in GitLab (must have for code reviews!). 

![Image of plugin](https://github.com/tomasbonco/gitlabtree/blob/master/screenshot.png)


## Contribution

Star, if you like :) Open an issue, if you find a bug or you miss something. Send a Pull Request when you decided to extend/fix (thank you for that!).


## How to build

First you need [NodeJS](https://nodejs.org/en/) installed. Then you can install all dependencies by:
```
npm install
```

Or if you are using Yarn:
```
yarn install
```

And run a debug build:
```
npm run watch
```


## License

MIT 
