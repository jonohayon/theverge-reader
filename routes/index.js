var express = require("express");
var debug = require("debug")("theverge-reader");
var request = require("request");
var parseString = require("xml2js").parseString;
var router = express.Router();

router.get("/", function (req, res) {
	request("http://www.theverge.com/rss/index.xml", function (error, response, body) {
		if (!error && response.statusCode == 200) {
			parseString(body, function (error, result) {
				if (!error) {
					var posts = [];
					result.feed.entry.forEach(function (obj) {
						posts.push({
							post_title : obj.title,
							post_update : obj.updated[0],
							post_author : obj.author[0].name[0],
							post_url : obj.id[0]
						});
					});
					res.render("index", { posts : posts, title : result.feed.title[0] });
				}
			});
		}
	});
});

router.get("/viewPost", function (req, res) {
	if (!/theverge\.com/.test(req.query.src)) {
		res.json({
			error : {
				message : "ENTURL - Wrong URL",
				code : 1
			}
		});
	} else {
		res.render("post-view", { title : req.query.title, post_url : req.query.src, articles_path : req.query.path });
	}
});

var hubs = [{
	hub_name : "Android",
	hub_path : "/android"
}, {
	hub_name : "Apple",
	hub_path : "/apple"
}, {
	hub_name : "Apps",
	hub_path : "/apps"
}, {
	hub_name : "BlackBerry",
	hub_path : "/blackberry"
}, {
	hub_name : "Culture",
	hub_path : "/culture"
}, {
	hub_name : "Gaming",
	hub_path : "/gaming"
}, {
	hub_name : "HD",
	hub_path : "/hd"
}, {
	hub_name : "Microsoft",
	hub_path : "/microsoft"
}, {
	hub_name : "Mobile",
	hub_path : "/mobile"
}, {
	hub_name : "Photography",
	hub_path : "/photography"
}, {
	hub_name : "Policy",
	hub_path : "/policy"
}, {
	hub_name : "Web",
	hub_path : "/web"
}];

router.get("/hubs", function (req, res) {
	res.render("hubs", { title : "The Verge Hubs", hubs : hubs });
});

hubs.forEach(function (obj) {
	router.get(obj.hub_path, function (req, res) {
		request("http://www.theverge.com" + obj.hub_path + "/rss/index.xml", function (error, response, body) {
			if (!error && response.statusCode == 200) {
				parseString(body, function (error, result) {
					if (!error) {
						var posts = [];
						result.feed.entry.forEach(function (obj) {
							posts.push({
								post_title : obj.title,
								post_update : obj.updated[0],
								post_author : obj.author[0].name[0],
								post_url : obj.id[0]
							});
						});
						res.render("hub", { posts : posts, title : result.feed.title[0], hub_path : req.query.path });
					}
				});
			}
		});
	});
});

// NOT ACTIVE RIGHT NOW
// router.get("/settings", function (req, res) {
// 	res.render("settings", { title : "Font & Type Settings" });
// });

module.exports = router;
