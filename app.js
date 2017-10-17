var http 		= require("https");
var schedule 	= require("node-schedule");
var sqlite3 	= require("sqlite3");
var read 		= require("read-file");
var fs 			= require("fs");

var debug 		= false;

function postToFacebook(PageUA) {

	var directory = "";
	var usedDir = "";
	var defURL = "http://klat9.org/Alexander/usedVSAUCE/";

	if (!debug) {
		directory = "../public_html/Alexander/VSAUCE/";
		usedDir = "../public_html/Alexander/usedVSAUCE/";
		defURL = "http://klat9.org/Alexander/usedVSAUCE/";
	} else {
		directory = "C:/Users/ZCU/OneDrive/Billeder/meams/VSAUCE/";
		usedDir = "C:/Users/ZCU/OneDrive/Billeder/meams/debug/";

	}
	
	var nodeID = "797535417069812";
	var albumID = "797600387063315";

	//choose random file from folder

	var files = fs.readdirSync(directory);
	var fileIndex = Math.floor(Math.random() * files.length);
	var filename = files[fileIndex];
	var file = directory + filename;
	var newPath = usedDir + filename;

	//move that file to the used directory

	fs.renameSync(file, newPath);

	//check if there should be posted a message

	var db = new sqlite3.Database("vsauce.db");

	var message = "";

	try{

		db.all("SELECT * FROM messages LIMIT 1", function(err, messageRows){
			if (messageRows.length != 0) {
				message = messageRows[0].message;
				db.run("DELETE FROM messages WHERE id = (?)", messageRows[0].id );
			}

			//post to facebook

			var imageUrl = defURL + filename;

			if (!debug) {
				var post_options = {
				    host: 'graph.facebook.com',
				    path: '/'+ albumID +'/photos?url='+ imageUrl
				    +'&message=' + encodeURI(message)
				    +'&access_token=' + PageUA,
				    method: 'POST'
				      
				};

				try {

					var post_req = http.request(post_options, function(res) {
				    	res.setEncoding('utf8');
				    	res.on('data', function (chunk) {
				        	console.log('Response: ' + chunk);
						});
					});

							  // post the data
							  
					post_req.end();

				} catch(tryErr){
					console.log(tryErr);
				}
			} else {
				console.log(imageUrl);
				console.log(fileIndex);
				console.log(file);
				console.log(newPath);
			}


		});	
	} catch(tryErr2){
		console.log(tryErr2);
	}

}

var postSchedule;

if (debug) {
	postToFacebook(read.sync("./PageToken"));
} else {
	postSchedule = schedule.scheduleJob("0 0 */4 * * *", function(){
		postToFacebook(read.sync("./PageToken"));
	});
} 