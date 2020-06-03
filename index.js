const Joi = require('@hapi/joi');
const express = require('express');
const AWSXRay = require('aws-xray-sdk');
const rp = require('request-promise');
const app = express();

//Capture all outgoing http requests
AWSXRay.captureHTTPsGlobal(require('http'));

//enable JSON parsing in body request
//i.e. enabling middleware
app.use(express.json());
app.use(AWSXRay.express.openSegment('MyApp'));

const courses = [
    {id: 1, name: 'Course 1'},
    {id: 2, name: 'Course 2'},
    {id: 3, name: 'Course 3'}
];

app.get('/', (req, res) => {
    res.send('Hello World!!!');
});

app.get('/api/books', async (req,res) =>{
    console.log('Method /api/books called!')
    
    // querying book-api service that is in the same VPC.  
    rp('http://book-api.local:3000/api/books')
      .then(function(output){
          return res.send(output);
      })
      .catch(function(error){
          console.log(error);
          return res.statusCode(400).send(error);
      });
});

app.get('/api/cats', async (req,res) =>{
    console.log('Method /api/cats called!')

    rp('https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1')
      .then(function(output){
          console.log('http req finished');
          return res.send(output);
      })
      .catch(function(error){
          console.log(error);
          return res.statusCode(400).send(error);
      });
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.get('/api/courses/:id', (req,res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course){
        //Return 404
        res.status(404).send('The course with the given ID was not found...');
    } else {
        res.send(course);
    }
});

app.post('/api/courses', (req,res) => {
    const { error } = validateCourse(req.body); //result.error
    if (error){
        // Return HTTP 400 Bad Request
        res.status(400).send(error.details[0].message);
        return;
    }

    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req,res) => {
    //Look up the course
    //If not exist, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course){
        //Return 404
        res.status(404).send('The course with the given ID was not found...');
        return;
    }

    //Validate
    //If invalid, return 404
    const { error } = validateCourse(req.body); //result.error
    if (error){
        // Return HTTP 400 Bad Request
        res.status(400).send(error.details[0].message);     
        //res.send('Error occurred!');
        return;
    }

    //Update Course
    course.name = req.body.name;
    //Return updated course
    res.send(course);
    
});

app.delete('/api/courses/:id', (req,res) => {
    //Look up the course
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course){
        //Return 404
        res.status(404).send('The course with the given ID was not found...');
        return;
    }

    //Delete
    const index = courses.indexOf(course);
    courses.splice(index,1);

    //Return the same course
    res.send(course);
})

app.use(AWSXRay.express.closeSegment());

function validateCourse(course){
    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(course, schema);
}

// app.get('/api/posts/:year/:month', (req,res) => {
//     res.send(req.query);
// });

const port = process.env.PORT || 3000;
app.listen(3000, () => console.log(`Listening on port ${port}...`));