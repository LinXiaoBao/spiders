var https = require('https'),
	cheerio = require('cheerio'),
	assert = require('assert'),
    MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/MeGa';

// 爬豆瓣电影top250
function spiderMovie(index) {
    https.get('https://movie.douban.com/top250?start=' + index, function (res) {
        var pageSize = 25;
        var html = ''; 
        var movies = [];  
        res.setEncoding('utf-8');	  
        res.on('data', function (chunk) {
            html += chunk; 
        });
        res.on('end', function () {
            var $ = cheerio.load(html);
            $('.item').each(function () {
                var movie = {
                    'title': $('.title', this).text(), 
                    'star': $('.info .star .rating_num', this).text(), 
                    'link': $('a', this).attr('href'), 
                    'picUrl': $('.pic img', this).attr('src'),
                    'label': '豆瓣电影top250'
                };
                if (movie) {
                    movies.push(movie);
                    console.log("ljf");
                }
            });
            saveData('movies', movies, function(result){
            	console.log(result);
            });
        });
    }).on('error', function (err) {
        console.log(err);
    });
} 
// 爬豆瓣读书top250
function spiderBook(index) {
    https.get('https://book.douban.com/top250?start=' + index, function (res) {
        var pageSize = 25;
        var html = ''; 
        var books = [];  
        res.setEncoding('utf-8');	  
        res.on('data', function (chunk) {
            html += chunk; 
        });
        res.on('end', function () {
            var $ = cheerio.load(html);
            $('tr.item').each(function () {
            	var commentsNum = $('.star .rating_nums', this).next('span').text().split('(')[1].split(')')[0].trim().split("人")[0];
            	
                var book = {
                    'title': $('td', this).eq(1).find('a').attr('title'), 
                    'titleOther': $('td', this).eq(1).find('span').eq(0).text(), 
                    'star': $('.star .rating_nums', this).text(), 
                    'commentsNum': commentsNum, 
                    'link': $('a.nbg', this).attr('href'), 
                    'picUrl': $('a.nbg img', this).attr('src'),
                    'label': '豆瓣读书top250'
                };
                if (book) {
                    books.push(book);
                }
            });
            saveData('books', books, function(result){
            	console.log(result);
            });
        });
    }).on('error', function (err) {
        console.log(err);
    });
} 
// 把数据保存到数据库
function saveData(collections, document, callback){
	var insertManyDocs = function(db, cb) {
		var collection = db.collection(collections);
		collection.insertMany(document, function(err, result) {
			assert.equal(err, null);
			callback(result);
		});
	};
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		insertManyDocs(db, function() {
			db.close();
		});
	});
}

for(var i=0;i<250;i=i+25){
	spiderMovie(i);
}

for(var j=0;j<250;j=j+25){
	spiderBook(j);
}
