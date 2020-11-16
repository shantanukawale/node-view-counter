# node-view-counter
> 1. APIs to track views for posts.
> 2. Unique documents per user and post.
> 3. Also keeps track of the number of times the same user has seen the same post.

## Tech Used:
> 1. Node.js (Express)
> 2. MongoDb
> 3. Redis
> 4. AWS (SQS)

## Why Mongo and not MySQL?
> 1. Count queries get out of hand when at scale.
> 2. Mongo handles it much better.
> 3. Uses MongoDb's increment function to avoid race conditions.

## What is the purpose of using AWS SQS?
> 1. Allows lossless view counting in case of infra failure.

## How is Redis being used?
> 1. Views are stored with the lastUpdatedAt time. During retrieval, count query counts the documents created after this lastUpdateAt time making reads much faster and reducing number of documents being scanned.

## How can I try these APIs out?
> 1. Clone the project.
> 2. cd into the root directory of the project.
> 3. Run `cp .env.sample .env` and edit .env parameters according to your environment.
> 4. Run migration scripts from `./migrations` folder in your mongo console
> 5. Run `npm i && npm run dev`
> 6. Import APIs into postman from this link: [Postman Collection - https://www.getpostman.com/collections/90407d8963b2ef849981](https://www.getpostman.com/collections/90407d8963b2ef849981)

## Possible future improvements:
> 1. Could be made more generic by adding a type parameter if needed for use other than posts.