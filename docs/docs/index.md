# Overview

`digest-axios` is a NodeJS library which implements HTTP digest authentication in a
manner which should be familiar to any project which also uses Axios.

This library **is not affiliated with the Axios project** or its maintainers, other than its
input/output data structures being identical to those Axios uses, and it relying on Axios.

## Installation

```
$ npm i digest-axios
```

## Essential Usage

```js
import DigestAxios from 'digest-axios';

const digestAuth = new DigestAxios({
  username: process.env.MY_DIGEST_USERNAME,
  password: process.env.MY_DIGEST_PASSWORD,
});

const MakeARequest = async () => {
  const response = await digestAuth.request({
    headers: { Accept: "application/json" },
    method: "GET",
    url: "https://cloud.mongodb.com/api/atlas/v1.0/groups",
  });
}
```
