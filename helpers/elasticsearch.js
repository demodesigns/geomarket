var mongoose = require('mongoose'),
	Ad = mongoose.model('Ad'),
	ElasticSearchClient = require('elasticsearchclient'),
	_ = require('underscore'),
	url = require('url'),
	config = require('../config'),
	async = require('async');

var connectionString = url.parse(config.elasticsearch.url);
var serverOptions = {
	host: connectionString.hostname,
	port: connectionString.port,
	secure: false,
/*	auth: {
        username: connectionString.auth.split(":")[0],
        password: connectionString.auth.split(":")[1]
    }  */
};


var elasticSearchClient = new ElasticSearchClient(serverOptions);

var trim_new_word = function(text) {
	text = text.trim();
	var i = text.lastIndexOf(' ');

	if ((text.length - i) <=  config.elasticsearch.ngramMin) {
		return text.substring(0, i);
	}
	return text;
}

var remove_special = function(text) {
	return text.replace('-', ' ');
}

exports.search = function(index, type, text, callback) {
	if (text == '' || text == null) {
		return callback(null, {});
	}

	var identifiers = new Array(),	// this gets returned
		ids = new Array();

	text = trim_new_word(text);

    elasticSearchClient.search(index, type,
        {
            "query": {
                "bool" : {
                    "minimum_should_match" : 1,

                    "should" : [
                        {
                            "query_string": {
                                "default_operator": "AND",
                                "fields": ['title.grams^10', 'description.grams^5'],
                                "query": text
                            }
                        },
                        {
                            "match_phrase": {
                                "title.id": {
                                    "query": text,
                                    "fuzziness": 1,
                                    "operator" : "and",
                                    "prefix_length": 1,
                                    "boost": 5
                                }
                            }
                        },
                        {
                            "match": {
                                "title.id": {
                                    "query": text,
                                    "fuzziness": 1,
                                    "operator": "and",
                                    "prefix_length": 1
                                }
                            }
                        },
                        {
                            "match": {
                                "description.id": {
                                    "query": text,
                                    "operator" : "and",
                                    "prefix_length": 1
                                }
                            }
                        }
                    ]
                }
            }
        }, function(err, data) {
            if (err) {
                return callback(err);
            }

            try {
                data = JSON.parse(data);
            } catch(err) {
                return callback(new Error('Cannot access elasticsearch index.'));
            }

            if (data.hits != 'undefined' && data.hits != null && data.hits.total != 0) {
                data = data.hits.hits;
                data.forEach(function(doc) {
                    var id = doc._id;
                    // collect the IDs that match the term
                    if (!(_.contains(ids, id))) {
                        ids.push(id);
                        identifiers.push(id);
                    }
                });

                return callback(null, identifiers);
            } else {
                return callback(null, identifiers  );//, relevantProduct);
            }
        });
};

// index must be lowercase and no numbers!
// also initializes char_filter to get rid of special characters that es-0.9.1 doesn't support
exports.createNgramAnalyzer = function(callback) {
	var ngramIndex = config.elasticsearch.ngramIndex,
		min = config.elasticsearch.ngramMin,
		max = config.elasticsearch.ngramMax;

	elasticSearchClient.deleteDocument(ngramIndex, function(err) {
		if (err) {
    		return callback(err);
       	}

		elasticSearchClient.index(ngramIndex, null, {
	        "settings" : {
	            "analysis" : {
	                "analyzer" : {
	                    "edge_ngram_analyzer" : {
	                        "tokenizer" : "edge_ngram_tokenizer"
	                    }
	                },
	                "tokenizer" : {
	                    "edge_ngram_tokenizer" : {
	                        "type" : "edgeNGram",
	                        "min_gram" : min,
	                        "max_gram" : max,
	                        "token_chars": [ "letter", "digit" ]
	                    }
	                }
	            }
	        }
	    }, function(err) {
	    	if (err) {
	    		return callback(err);
	    	}

	    	return callback(null);
	    });
	});
};

// this method of indexing drops the entire index and then recreates it.
exports.indexAll = function(callback) {
	var bulkCommands = [];

	Ad.find({}, function(err, ads) {
		if (err) {
			return callback(err);
		}

		// first dump and then re-create the index
		elasticSearchClient.deleteDocument(config.elasticsearch.entityIndex, function(err, data) {
			if (err) {
				return callback(err);
			}

			// create settings for synonms_expand. this analyzer works during search phase (not index).
			elasticSearchClient.index(config.elasticsearch.entityIndex, null, {
		        "settings" : {
		            "analysis" : {
		                "analyzer" : {
		                	"standard" : {
		                		"type" : "standard",
		                		"stopwords" : "_none_"
		                	},
		                    "synonyms_tokenized" : {
		                    	"tokenizer" : "whitespace",
		                    	"filter" : ["synonyms_expand", "lowercase"]
		                    },
		                    "synonyms_fulltext" : {
		                    	"tokenizer" : "keyword",
		                    	"filter" : ["synonyms_expand", "lowercase"]
		                    },
		                    "edge_ngram_analyzer" : {
		                        "tokenizer" : "edge_ngram_tokenizer",
		                        "filter": ["lowercase"]
		                    }
		                },
		                "filter": {
		                	"synonyms_expand" : {
		                		"type" : "synonym",
		                		"synonyms_path" : "analysis/synonyms.txt",
		                	}
		                },
		                "tokenizer" : {
		                    "edge_ngram_tokenizer" : {
		                        "type" : "edgeNGram",
		                        "min_gram" : config.elasticsearch.ngramMin,
		                        "max_gram" : config.elasticsearch.ngramMax,
		                        "token_chars": [ "letter", "digit" ]
		                    }
		                }
		            }
		        },
		        "mappings" : {
		        	"gram" : {
		        		"properties" : {
		        			"title.grams" : {
		        				"type" : "string",
           						"search_analyzer": "standard",
           						"index_analyzer" : "edge_ngram_analyzer"
		        			},
		        			"description.grams" : {
		        				"type" : "string",
		        				"search_analyzer": "standard",
           						"index_analyzer" : "edge_ngram_analyzer"
		        			},
		        			"title.id" : {
		        				"type" : "string",
		        				"search_analyzer": "standard",
           						"index_analyzer" : "synonyms_tokenized"
		        			},
		        			"description.id" : {
		        				"type" : "string",
		        				"search_analyzer": "standard",
           						"index_analyzer" : "synonyms_tokenized"
		        			},
		        			"ft_title": {
		        				"type" : "string",
		        				"analyzer": "synonyms_fulltext"	
		        			},
		        			"ft_description": {
		        				"type" : "string",
		        				"analyzer": "synonyms_fulltext"	
		        			}
		        		}
		        	}
		        }
		    }, function(err) {
		    	if (err) {
		    		console.log(err);
		    		return callback(err);
		    	}

				async.eachSeries(ads, function(ad, cb) {
					var	title = ad.title,
						description = ad.description,
						ft_title = title,
						ft_description = description;
	
					// must override the elasticsearch lowercase because synonyms applies to the unfiltered case-sensitive version
					if (title && description) {
						title = title.toLowerCase();
						title = title.split(' ');
						description = description.toLowerCase();
						description = description.split(' ');

						// add duplicate versions of words with hyphens replaced with spaces
						var duplicates = [];
						title.forEach(function(str) {
							if (_.contains(str, "-")) {
								str = str.replace("-", " ");
								duplicates.push(str);
							}
							if (_.contains(str, "'")) {
								str = str.replace("'", "");
								duplicates.push(str);
							}	
						});
						title = title.concat(duplicates);
						
						var duplicates = [];
						description.forEach(function(str) {
							if (_.contains(str, "-")) {
								str = str.replace("-", " ");
								duplicates.push(str);
							}
							if (_.contains(str, "'")) {
								str = str.replace("'", "");
								duplicates.push(str);
							}	
						});
						description = description.concat(duplicates);
						
						var indexMap = {
							ft_title: ft_title,
		            		ft_description: ft_description,
							title: {
								id: title,
								grams: title
							},
							description: {
								id: description,
								grams: description
							}
						}

						bulkCommands.push({
							"index" : {
								"_index": config.elasticsearch.entityIndex,
								"_type": "gram",
								"_id": ad._id
							}
						});

						bulkCommands.push(indexMap);
					}

					cb(null);
				}, function(err) {
					if (err) {
						return callback(err); 
					}

					elasticSearchClient.bulk(bulkCommands, {}, function(err, data) {
                        if (err) { 
                            return callback(err);
                        }
                 
                        return callback(null);
                    });
				});
			});
		});
	});
};

exports.index = function(ad, callback) {
	var bulkCommands = [];

	Ad.find({_id: ad._id}, function(err, ads) {
	    if (err) {
	        console.log(err);
	        return callback(err);
	    }

    	async.eachSeries(ads, function(ad, cb) { 
    		var id = ad._id,
				title = ad.title;
				description = ad.description,
				ft_title = title,
				ft_description = description,
        	
			title = title.toLowerCase();
			title = title.split(' ');
			description = description.toLowerCase();
			description = description.split(' ');

			// add duplicate versions of words with hyphens replaced with spaces
			var duplicates = [];
			title.forEach(function(str) {
				if (_.contains(str, "-")) {
					str = str.replace("-", " ");
					duplicates.push(str);
				}
				if (_.contains(str, "'")) {
					str = str.replace("'", "");
					duplicates.push(str);
				}	
			});
			title = title.concat(duplicates);
			
			var duplicates = [];
			description.forEach(function(str) {
				if (_.contains(str, "-")) {
					str = str.replace("-", " ");
					duplicates.push(str);
				}
				if (_.contains(str, "'")) {
					str = str.replace("'", "");
					duplicates.push(str);
				}	
			});
			description = description.concat(duplicates);

			var indexMap = {
				ft_title: ft_title,
        		ft_description: ft_description,
				title: {
					id: title,
					grams: title
				},
				description: {
					id: description,
					grams: description
				}
			}

			bulkCommands.push({
				"index" : {
					"_index": config.elasticsearch.entityIndex,
					"_type": "gram",
					"_id": ad._id
				}
			});
			bulkCommands.push(indexMap);

			cb(null);
		}, function(err) {
			if (err) { 
				return callback(err); 
			}

			elasticSearchClient.bulk(bulkCommands, {}, function(err, data) {
                if (err) { 
                        return callback(err);
                }
         
                return callback(null);
            });
		});
	});
};