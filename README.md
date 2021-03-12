# Blog

A blog website built using MEAN stack

## Features

- **Authentication** - Users can register and log in to create, comment and like posts
- **Profile** - Registered users have and editable profile, including a photo
- **Posts** - User written content. Can be deleted and edited by the author
- **Likes** - Registered users can like or dislike posts
- **Comment** - All posts can be commented on by registered users
- **Markdown** - Posts are written in a markdow editor and processed using a light version of markdown
- **Responsive** - Webpages adapt to the size of the screen
- **Dark mode** - Logged in users can switch between the light and dark theme

## Programming

The entire application is written in javascript. The back end is a node server that uses express for routing, passport and jwt for authentication, and mongoose as the database driver. The front end is an angular app and uses bootstrap for styling. The data is stored in a MongoDB database. Markdown processing is done using [this](https://github.com/VladimirV99/Markdown) library.

## Required software

- nodejs - JavaScript runtime environment
- npm - package manager for nodejs applications
- MongoDB - a NoSQL database program

## Environment variables

- NODE_ENV - Set to 'production' to use production mode
- PORT - Port to run the server on (default 3000)
- DB_HOST - Database connection URL (default 'mongodb://localhost:27017/blog')
- PASSPORT_SECRET - Key used for authentication (default 'blog')

## Starting the website

First start the mongodb server to run our databse

    sudo mongod --dbpath [path]
    
just replace [path] with the wanted path. You can access the database from the terminal

    mongo

Now you can start the back end server. It will automatically restart itself on when a file is changed

    npm run dev

and finally serve the angular front end

    npm run start --prefix client

You can now open the website on localhost:4200 in the browser. To close the app shut down the servers in the reverse order.

## Building for production

Build the client to get served from the back end server

    npm install --prefix client
    npm run prod --prefix client

or use the heroku postbuild script which will do the same

    npm run heroku-postbuild

then install server-side dependencies and start the server in production mode

    npm install
    env NODE_ENV=production npm run start

you can also set other environment variables to fit your environment

## License

Blog is licensed under the MIT license. That means you are free to modify and distribute the software for commercial purposes (even under different terms or without source code) or use is privately. The only condition is that a copy of the license must be included with the software.

## Contributing

Feel free to contribute to the project either by submitting issues or making pull requests.

Thank you for the help :blush:
