# File-Boxes

ReactJS Website with a NodeJS backend to display CSV files in boxes allowing upload, editing and downloading.

## Installation & Running instructions

1. Clone this repository
2. cd into the repository and run the command `npm install && cd client && npm install`
3. Create a database/secrets.json file that should look like this

```json
{
    "DB_USERNAME":
    "DB_PASSWORD":
    "DB_URL":
    "DB_NAME":
}
```

4. You're all set to go just run `npm start` from the main folder

#### Note: Currently Semantic UI has an error in its min.css if you get a base 64 error when running follow these steps

5. https://github.com/Semantic-Org/Semantic-UI-React/issues/4287#issuecomment-1016579332
