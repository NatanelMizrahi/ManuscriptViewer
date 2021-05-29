var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var multer = require("multer");
var fs = require("fs");
var rmdir = require("rimraf");
var ncp = require('ncp').ncp;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

const test_users = require('./test/users').test_users;
//URLs
const production = (process.env.NODE_ENV === 'production');
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/tiip191";

// MongoDB
var dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(mongoURI, dbOptions);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Database connection ready");
  startServer();
});

//Initialize the app
var startServer = function () {
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
}

// Mongoose Schemas
var UserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: String,
  manuscriptIds: [Schema.Types.ObjectId]
});

var VersionSchema = new Schema({
  _id: Schema.Types.ObjectId,
  versionIds: [Schema.Types.ObjectId]
});

var ManuscriptFileSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  modified: Date,
  url: String
});

var ManuscriptSchema = new Schema({
  createDate: Date,
  _id: Schema.Types.ObjectId,
  title: String,
  author: String,
  date: Date,
  language: String,
  description: String,
  content: String,
  files: [ManuscriptFileSchema],
  versionId: Schema.Types.ObjectId,
  ownerId: Schema.Types.ObjectId,
  versions: [Schema.Types.ObjectId]
});

var Manuscripts = mongoose.model('Manuscripts', ManuscriptSchema);
var Versions = mongoose.model('Versions', VersionSchema);
var Users = mongoose.model('Users', UserSchema);

// Express
var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ "error": message });
  return false;
}

function IdQuery(id) {
  return ({ '_id': mongoose.Types.ObjectId(id) })
}

/*  "/api/manuscripts"
*    GET: finds all manuscripts
*    POST: creates a new manuscript
*/

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/src/index.html'));
});

var getManuscripts = function (manuscriptIds, res) {
  console.log("aggregated manuscript IDs:", manuscriptIds);
  // var idArray = manuscriptIds.map(idArr => mongoose.Types.ObjectId(idArr.last));
  Manuscripts.find({ _id: { $in: manuscriptIds } }, function (err, docs) {
    if (err) handleError(res, err.message, "Failed to get manuscripts.");
    else {
      console.log(docs);
      res.status(200).json(docs)};
  });
  return true;
}

app.get("/api/users/:id", function (req, res) {
  //Get all the manuscripts of user with the ID "id"
  console.log(IdQuery(req.params.id));
  Users.findById(req.params.id, function (err, user) {
    if (err) handleError(res, err.message, `Failed to get manuscripts for userID: ${req.params.id}`);
    else if (!user) handleError(res, "Trying to get user returned null.", `Failed to get manuscripts for userID: ${req.params.id}`);
    else getManuscripts(user.manuscriptIds, res);
  });
});

app.get("/api/manuscripts", function (req, res) {
  //Get the most recent versionID from each manuscript
  Versions.aggregate([{
    $project: { last: { $arrayElemAt: ["$versionIds", -1] } }
  }]).then(docs => getManuscripts(
      docs.map(idArr => mongoose.Types.ObjectId(idArr.last)),
      res))
      .catch(console.error);
});

//Validate form
var ValueError = function (res, fieldname) {
  handleError(res, `Invalid user input", "${fieldname} is mandatory.`, 400);
  return false;
}

var checkValidEntry = function (req, res) {
  if (!req.body.title) return ValueError(res, "title");
  if (!req.body.author) return ValueError(res, "author");
  if (!req.body.language) return ValueError(res, "language");
  if (!req.body.description) return ValueError(res, "description");
  if (!req.body.content) return ValueError(res, "content");
  return true;
}

var createVersionEntry = (_id) => ({ _id: _id, versionIds: [_id] });

var linkManuscriptToUserPromise = function(ownerId, manuscript_id){
  return new Promise( function(resolve,reject){
    Users.findOneAndUpdate(
        IdQuery(ownerId),
        { $push: { manuscriptIds: manuscript_id } },
        { new: true },
        function (err, userUpdated) {
          if (err) reject(res);
          else {
            console.log("updated user:", userUpdated);
            resolve();
          }
        });
  });
}
//Returns a Promise of version creation
var createVersion = function(newManuscript){
  return new Promise(function (resolve, reject) {
    if (!newManuscript.versions || newManuscript.versions.length == 0) {
      Versions.create(createVersionEntry(newManuscript._id),
          function (err, versions) {
            if (err) handleError(res, err.message, "Failed to create version for new manuscript.");
            else {
              console.log("ownerID:", newManuscript.ownerId);
              linkManuscriptToUserPromise(newManuscript.ownerId, newManuscript._id)
                  .then(()=>{
                    console.log("new version:", versions);
                    resolve(versions);
                  })
                  .catch(console.err);
            }
          });
    }
    else {
      console.log("versionID to add:", newManuscript.versionId);
      Versions.findOneAndUpdate(
          IdQuery(newManuscript.versionId),
          { $push: { versionIds: newManuscript._id } },
          { new: true },
          function (err, versions) {
            if (err) handleError(res, err.message, "Failed to create new version for existing manuscript.");
            else {
              console.log("updated version:", versions);
              resolve(versions);
            }
          });
    }
  }); //end of Promise
}

app.post("/api/manuscripts", function (req, res) {
  var newManuscript = req.body;
  if (!checkValidEntry(req, res)) return;
  newManuscript._id = mongoose.Types.ObjectId();

  console.log("----------------Adding New Manuscript--------------");
  console.log("manuscript's current versionID:", newManuscript.versionId);
  var isNewManuscript = !newManuscript.versionId;
  if (isNewManuscript) newManuscript.versionId = newManuscript._id;
  newManuscript.createDate = new Date();

  createVersion(newManuscript)
      .then(versions => {
        newManuscript.versionId = versions._id;
        newManuscript.versions = versions.versionIds;
        createManuScript(newManuscript, res);

      })
      .catch(console.error);
});

var createManuScript = function(newManuscript, res){
  Manuscripts.create(newManuscript, function (err, doc) {
    if (err) return handleError(res, err.message, "Failed to create new manuscript.");
    //update the version array for each manuscript version inside it
    updateVersionsArray(newManuscript.versions, function () {
      copyFilesToNewVersion(res, newManuscript, function () {
        res.status(201).json(doc);
        console.log("Created Manuscript:", doc);
      })
    });
  });
};

var updateVersionsArray = function (versionIds, callback = () => { }) {
  console.log("-------updating versions-------");
  console.log("updating versions for:", versionIds);
  Manuscripts.updateMany(
      { _id: { $in: versionIds.map(mongoose.Types.ObjectId) } },
      { $set: { versions: versionIds } },
      { new: true },
      function (err, docs) {
        console.log("updated versions for:", docs);
        callback();
      });
}

/*  "/api/manuscripts/:id"
 *    GET: find manuscript by id
 *    PUT: update manuscript by id
 *    DELETE: deletes manuscript by id
 */

app.get("/api/manuscripts/:id", function (req, res) {
  Manuscripts.findOne(IdQuery(req.params.id), function (err, doc) {
    if (err) handleError(res, err.message, "Failed to get manuscript");
    else res.status(200).json(doc);
  });
});

app.put("/api/manuscripts/:id", function (req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;
  Manuscripts.replaceOne(IdQuery(req.params.id), updateDoc, function (err, doc) {
    if (err) return handleError(res, err.message, "Failed to update manuscript");
    updateDoc._id = req.params.id;
    res.status(200).json(updateDoc);
  });
});

app.delete("/api/manuscripts/:id", function (req, res) {
  Manuscripts.findOne(IdQuery(req.params.id), function (err, manuscriptDoc) {
    if (err) return handleError(res, err.message, "Failed to get manuscript for delete");
    Versions.findOneAndRemove(IdQuery(manuscriptDoc.versionId),function (err,versions){
      console.log(versions);
      Manuscripts.deleteMany(
          { _id: { $in: versions.versionIds.map(mongoose.Types.ObjectId) } },
          function (err, docs) {
            deleteDir(getManuscriptPath(manuscriptDoc.ownerId,manuscriptDoc.versionId), function(err){
              if (err) return handleError(res, err.message, "Failed to delete files");
              console.log("deleted versions for:", manuscriptDoc.versionId)
              res.status(200).json(req.params.id);
            });
          });
    });
    // Manuscripts.deleteOne(IdQuery(req.params.id), function (err, result) {
    //   if (err) handleError(res, err.message, "Failed to delete manuscript");
    //   else res.status(200).json(req.params.id);
    // });
  });
});

/***************
 * File upload *
 ***************/
// const uploadsURL = 'src/assets/uploads/';
const uploadsURL = 'uploads/';
app.use('/'+ uploadsURL , express.static(path.join(__dirname, uploadsURL)));

var getDirPath = (req) => `${uploadsURL}${req.params.ownerid}/${req.params.title}/version${req.params.version}`;
var getManuscriptPath = (ownerId, title) => `${uploadsURL}${ownerId}/${title}`;
var getVersionPath = (ownerId, title, version) => `${getManuscriptPath(ownerId, title)}/version${version}`;


// specify the folder
// app.use(express.static(path.join(__dirname, uploadsURL)));
var storage = multer.diskStorage({
  // destination
  destination: (req, file, cb) => cb(null, getDirPath(req)),
  filename: (req, file, cb) => {
    var ext = file.originalname.split(".").pop();
    var name = file.originalname.replace(/[ .]/g, '_');
    cb(null, `${name}_${Date.now()}.${ext}`)
  }
});

// headers and content type
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// MongoDB file upload
// make Promise version of fs.readFile() and upload to DB

uploadFileAsync = function (file) {
  return new Promise(function (resolve, reject) {
    fs.readFile(file.path, 'utf8', function (err, data) {
      if (err) reject(err);
      else {
        var newFile = new ManuscriptFile();
        var id = mongoose.Types.ObjectId()
        newFile.data = data;
        newFile.type = file.mimetype;
        newFile._id = id;
        newFile.encoding = file.encoding;
        newFile.name = file.originalname;
        newFile.size = file.size;
        newFile.modified = new Date();
        newFile.index = 0;
        newFile.save();
        file._id = id;
        console.log(`${file.originalname} uploaded to DB`);
        resolve(file);
      }
    });
  });
};

var uploadToDB = function (req, res) {
  Promise.all(req.files.map(uploadFileAsync))
      .then(files => {
        console.log("files uploaded to DB successfully:");
        return res.json(files);
      });
};

var updateFileList = function (req, res) {
  return res.json(req.files.map(file => (
      {
        url: file.path,
        name: file.originalname
      }
  )));
}


function mkdirRec(path, basePath=""){
  let pathAsArray = path.split(/\\|\//g);
  let currentPath= basePath;
  console.log("[mkdir] full path:", basePath + pathAsArray.join('/'));
  for (let i = 0; i < pathAsArray.length; i++) {
    currentPath += pathAsArray[i] + "/";
    if (!fs.existsSync(currentPath))
      fs.mkdirSync(currentPath);
  }
}
var ensurePathExists= function(req, res, next){
  mkdirRec(getDirPath(req));
  next();
}

var copyFilesToNewVersion = function(res, newManuscript,callback){
  let numOfVersions = newManuscript.versions.length;
  if(numOfVersions == 1)
    return callback(); //no need to copy, only one version
  let latestVersion = numOfVersions - 1;
  let versionToCopy = latestVersion - 1;
  let title = newManuscript.versionId;
  let ownerId = newManuscript.ownerId;
  let srcPath = path.join(__dirname, getVersionPath(ownerId,title, versionToCopy)); //current version folder
  let destPath = path.join(__dirname, getVersionPath(ownerId,title, latestVersion)); //new version folder
  mkdirRec(destPath); //create a diretory for the new version
  console.log(`Copying files from version #${versionToCopy} to version #${latestVersion}...`);
  ncp(srcPath, destPath, function (err) {
    if (err) return handleError(res, err.message, "Failed to copy files to new version.");
    console.log('Copying files complete.');
    callback();
  });
}

var deleteFiles= function(req, res){
  console.log("delete files:", req.body);
  let files = req.body.map(file=> file.url);
  var deletePromise = function(file){
    return new Promise((resolve, reject)=>{
      //uploadsURL + rew.params.versionId+'/version'+req.params.version
      fs.unlink(file, function(err){
        if (err) return handleError(res, err.message, "Failed to delete file:", file);
        resolve(file);
      });
    });
  }
  Promise.all(files.map(deletePromise)).then(files =>{
    console.info("deleted:",files);
    return res.status(200).json(files);
  }).catch(console.err);
}

var deleteDir = function(path, cb){
  rmdir(path, cb);
}

var maxFiles = 50;
var localStorage = true;

var upload = multer(localStorage ?
    { storage: storage } :
    { dest: uploadsURL }
);
const multUpload = upload.array('uploads[]', maxFiles);

app.post('/upload/:ownerid/:title/:version', ensurePathExists, multUpload, updateFileList);
app.delete('/upload/', deleteFiles );
// app.post('/upload/:id', multUpload, uploadToDB);

function addUser(req,res){
  const user = req.body;
  Users.insertOne(user)
      .then(doc => {
        console.log("Added the following user to the database:");
        console.log(doc);
        res.status(200).json(doc);
      })
      .catch(err => handleError(res, err.message, "Failed to add user"));
}
app.post('/api/users', addUser);

// Test Routes
function addTestUsers(req,res){
  const testUsersCopy = JSON.parse(JSON.stringify(test_users));
  for (let user of testUsersCopy)
    user._id = ObjectId(user._id);
  Users.insertMany(test_users)
      .then(users => {
        console.log("Added the following users to the database:");
        console.log(users);
        const randomUser = users[Math.floor(Math.random() * users.length)];
        res.redirect('/')
        // res.status(200).json(randomUser);
      })
      .catch(err => handleError(res, err.message, "Failed to add users. HINT: Maybe they already exist in DB?"));
}

app.get('/test/users', addTestUsers);

app.get('/test/resetdb', function (req,res) {
  db.dropDatabase()
      .then( _ => {
        console.log("Dropped Database");
        deleteDir(uploadsURL, function(err){
          if (err) return handleError(res, err.message, "Failed to delete files");
          console.log("Deleted " + uploadsURL);
          res.status(200).redirect('/test/users');
        })
      }).catch(err => handleError(res, err.message, "Failed to drop database"));
});
