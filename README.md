# active-json

Simple Active Record implementation based on `.json` files.

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation) 
    - [Prerequisites](#prerequisites)
    - [Installation steps](#installation-steps)
- [Usage](#usage)
    - [Creating model](#creating-model) 
    - [Usage examples](#usage-examples)
- [Extending](#extending)
    - [Creating custom data source](#creating-custom-data-source)


### Introduction 

Simple, no-dependency, with typescript support.

```ts
import { JsonDataSource, Model } from "active-json"
import { User } from "./models/user"

Model.setDataSource(new JsonDataSource("./data.json"));

const users = await User.find(({ name }) => name === "Jason");
```

### Installation

#### Prerequisites 

- Typescript version >= 3.5

#### Installation steps 

##### NPM 

```bash
npm install github:vladimirlihacky/active-record
```

##### Bun 

```bash
bun add github:vladimirlihacky/active-record
```

### Usage 

#### Creating model 

```ts
import { Model } from "active-json"

export class User extends Model {
    // Model fields should provide default values
    name: string = "Anonymous"; 
    password: string = "";
    age: number = 0;


    // You can override Model validate method
    static override validate(user: User): boolean {
        return (
            user.name !== "" &&
            user.age >= 18 && 
            user.password.length >= 8
        )
    }
}
```

#### Usage examples

```ts
// Get user by id 
const user = await User.findOne(({ id }) => id === 1);

// Create user
const user = await User.createOne({ 
    name: "user",
    age: 21,
    password: "pwd123"
});

// Update user with id 1
const user = await User.updateOne(
    ({ id }) => id === 1, 
    (user) => ({ ...user, name: "Updated" + user.name }),
)

// Delete all invalid users
const deletedUsers = await User.delete((user) => !User.validate(user));
```

### Extending

#### Creating custom data source

To customize data source you need to fulfill DataSource interface 

```ts
import type { DataSource } from "active-json"

export class TxtDataSource implements DataSource {
    //Your code here...
}
```