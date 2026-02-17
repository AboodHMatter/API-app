// const { validationResult } = require('express-validator');
// let courses = require("../data/courses.js").courses; 

// const getCourseById = (req, res) => {
//     const courseId = +req.params.courseId
//     const course = courses.find(c => c.id === courseId);
//     res.json(course);
//     res.status(200);
//     res.end();
// }


// const deleteCourseById = (req, res) => {
//         const courseId = +req.params.courseId
//         courses = courses.filter((course)=> course.id !== courseId);
//         res.status(200).json({success: true}).end();
//     }

// const addCourse = (req, res) => {
//     console.log({id: +courses.length + 1, ...req.body})
//     const errors = validationResult(req); 
//     console.log("errors", errors);
//     if (!errors.isEmpty()){
//         return res.status(400).json(errors.array()).end()
//     }
//     courses.push({id: courses.length + 1, ...req.body});
//     res.status(201).json(courses);
//     res.end();
// }

// const getAllCourses =  (req, res)=>{
//     res.json(courses);
//     res.status(200);
//     res.end();
// }

// module.exports = {getCourseById, addCourse, deleteCourseById, getAllCourses};
const { validationResult } = require('express-validator');
const Course = require("../models/course-model.js");
const asyncWrapper = require("./asyncWrabber.js");
const appErorr = require('../utilty/appError.js');

let getAllCourses = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;
  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);
  res.json({ status: "success", data: courses }).status(200).end();
})

let addCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const erorr = appErorr.create(errors.array(), 400, "fail");
    return next(erorr);
  }
  // console.log({id: courses.length + 1, ...req.body})
  const newCourse = new Course(req.body);
  await newCourse.save();
  res.status(201).json({ status: "success", data: newCourse }).end();
})

let getCourseById = asyncWrapper(async (req, res, next) => {
  // try {

  const course = await Course.findById(req.params.courseId);
  if (!course) {
    const erorr = appErorr.create("Course not found", 404, "errrrrr");
    return next(erorr);

    // const erorr = new Error();
    //   erorr.statusCode = 404;
    //   erorr.message = "Course not found";
    // return res.status(404).json({status: "fail", data: {course: "Course not found" }}).end();
  }
  return res.json({ status: "success", data: course }).status(200).end();
}
  //  catch (error) {
  //   res.status(400).json({status: "error", data: null, message: error.message, Code: 400 }).end();
  // }
  // }
)
let deleteCourseById = async (req, res) => {
  await Course.deleteOne({ _id: req.params.courseId });


  res.status(200).json({ status: "success", data: null }).end();

}


module.exports = { getAllCourses, getCourseById, addCourse, deleteCourseById };