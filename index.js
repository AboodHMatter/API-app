const {MongoClient} = require('mongodb');
const url = "mongodb+srv://abood:01110606308MDB@learn-mongodb.ask8hf9.mongodb.net/?appName=learn-mongoDB";
const client = new MongoClient(url);
const dbName = "codeZone";
const main = async ()=>{
    // try {
        await client.connect();
        console.log("connected to mongoDB successfully");
        const db = client.db(dbName); 
        const Collection = db.collection("courses");
        await Collection.insertOne({id: 6, title: "mongoDB", price: 499});
        const data = await Collection.find({}).toArray();
        console.log(data);
        // const result = await coursesCollection.insertMany(courses);
        // console.log(result);
    // }
    //  catch (error) {
    //     console.log(error);
    // }
}  
main();  