# Course API

This is a simple node express API project with AWS X-Ray Instrumentation.

This application is also containerized and runs in Amazon ECS with an X-Ray Daemon
> https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon-ecs.html

Incoming requests are traced on express following: 
> https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-middleware.html

Outgoing HTTP request are traced on the client: 
> https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-httpclients.html

Example Screenshot of X-Ray Trace
![Image of X-Ray Trace](/image/trace.png)