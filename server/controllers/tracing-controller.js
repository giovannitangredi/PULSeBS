const knex = require("./../db");
const moment = require("moment");
const checkManager = async (userId)=>{
    const result = await knex
    .select({ id: "id", role: "role" })
    .from("user")
    .where("id", userId)
    .catch(() => {
        throw { message: `There was an error retrieving user info`, status: 400 };
      });
    if (result[0].role != "manager") {
       return false;
      }
    return true;
}
// Find a student by the given SSN
exports.searchBySsn = async (req,res)=>{
    const ssn = req.params.ssn;
    const user = req.user && req.user.id;
    if(!(await checkManager(user)))
    {
        res.status(401).json({message: "Only manager can search by ssn.",})
    }
    knex
    .select(
        {id : "id"},
        {name : "name"},
        {surname : "surname"},
        {ssn : "ssn"},
        {email : "email"},
        {city : "city"},
        {birthday : "birthday"}
    )
    .from("user")
    .where("ssn",ssn)
    .andWhere("role","student")
    .then((queryResults)=>{
        if(queryResults.length == 0)
            {
                res.status(402).json({message: `There is none student with the following ssn`});
                return;
            }
        else
        {
            res.json(queryResults);
        }
    })
    .catch(err=>{
        res.status(501).json({message: `There were an error while retrieving the student : ${err}`});
    });
}
// Get the List of students and teacher that had contact with the positive student with id = studentId
exports.getContactTracingReport = async (req,res)=>{
    const studentId = req.params.studentId;
    const today = moment().format("YYYY-MM-DD HH:mm:ss");
    const threshold =  moment(today).subtract(14,'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
    const user = req.user && req.user.id;
    if(!(await checkManager(user)))
    {
        res.status(401).json({message: "Only manager can search by ssn.",})
    }
    //Find the teachers that taught the lectures that the positive student attended.
    const teachers = knex
    .select({id : "u.id"},
    {name : "u.name"},
    {surname : "u.surname"},
    {ssn : "u.ssn"},
    {email : "u.email"},
    {city : "u.city"},
    {birthday : "u.birthday"},
    {role : "u.role"},
    knex.raw('COUNT(*) as risk')
    )
    .from({ lb :"lecture_booking"})
    .join({l : "lecture"},"lb.lecture_id","=","l.id")
    .join({u : "user"},"u.id","=","l.lecturer")
    .where("l.end",">",threshold)
    .andWhere("l.end","<",today)
    .andWhere("lb.student_id",studentId)
    .andWhere("lb.status","present")
    .groupBy("l.lecturer");
    //Find the list of students of lecture the positive student was present
    const students =  knex
    .select({id : "u.id"},
    {name : "u.name"},
    {surname : "u.surname"},
    {ssn : "u.ssn"},
    {email : "u.email"},
    {city : "u.city"},
    {birthday : "u.birthday"},
    {role : "u.role"},
    knex.raw('COUNT(*) as risk')
    )
    .from({ lb :"lecture_booking"})
    .join({l : "lecture"},"lb.lecture_id","=","l.id")
    .join({u : "user"},"u.id","=","lb.student_id")
    .whereIn("lb.lecture_id",function () {
        //Select the list of lecture that the positive student has attended
        this.select("lecture_id")
          .from("lecture_booking")
          .where("student_id", studentId)
          .andWhere("status","present")
      })
    .andWhere("l.end",">",threshold)
    .andWhere("l.end","<",today) 
    .andWhere("lb.status","present") 
    .groupBy("u.id");

    //await Promises
    Promise.all([teachers,students])
    .then(([teachersQueries,studentsQueries]) =>{
        let result = [...teachersQueries,...studentsQueries];
        result = result.filter((el)=> el.id != studentId)
        res.json(result);
    })
    .catch(err=>{
        console.log(err)
        res.status(502).json({message : `An error occurred while generating the contac tracing report : ${err}`});
    });
}