const Discord = require('discord.js');
const fs = require('fs');
const readdirp = require('readdirp');

const emojiDB = require("./emojiDB.js");
const statsJS = require("./stats.js");

var bot = new Discord.Client()
//Fetch.js makes use of the readdirp module. If you want to know how this works. You'll need to check the module page.
let exp = JSON.parse(fs.readFileSync(`./exp.json`, 'utf8'));

module.exports = {
	validate: (client, message, args) => {
		if (!args[1]) {
			message.reply("I need some criteria in the form of a name!");
			return false;
		}

		if (message.guild.id == 383216614851739658) return true;

		var hasAnyRole = false;
		var banned = false;
		var notguildmessage = false;
		var msguild = client.guilds.get("335237931633606656")

		msguild.roles.forEach(function(role)
		{
			if (message.channel.type !== "text") {
				notguildmessage = true;
				return;
			}
			if (role.name == "@everyone") return;

			if (message.member.roles.exists(memberrole => memberrole.id === role.id)) {
				hasAnyRole = true;
			}

			if (message.member.roles.exists(memberrole => memberrole.name == "Support Banned")) {
				banned = true;
			}
		})

		if (notguildmessage) {
			message.react(emojiDB.react("cross"));
			message.channel.send("You must use this command in the MS Guild for it to function.");
			return false;
		}

		if (!hasAnyRole) {
			message.react(emojiDB.react("cross"));
			message.reply("\🤔```yml\n\nYou do not have the required roles to perform this command.\nMake sure you read and **accept** the rules at the welcome channel.\nFurther Instructions are noted.```")
			return false;
		}

		if (banned) {
			message.react(emojiDB.react("cross"));
			message.reply("You've been **banned** from support or helpful bot commands. What did you expect? \😒");
			return false;
		}
		return true;
	},
	fetchKeyword: (client, message, args) => {
		function compareAndScore(input, output) {
			var inp = input.replace("spell","").replace(".java","").replace("condition","").replace("effect","");
			var out = output.replace("spell","").replace(".java","").replace("condition","").replace("effect","");

			var inputArray = inp.split("");
			var outputArray = out.split("");

			var threshold = 2;
			var score = 0;
			for (i = 0; i < out.length; i++) if (inputArray[i] == outputArray[i]) score++;
			var percentage = score/out.length;

			if (inp.length - threshold > out.length) return 0.0;
			return percentage;
		}
		switch (args[1].toLowerCase())
			{
				case "guide":
					var embed = new Discord.RichEmbed()
						.setTitle(`Guide to using Fetch Efficiently`)
						.addField("KeyWords","If you are looking for... Use this keyword after the filename\nModifiers - [FileName]Condition\nSpells - [FileName]Spell\nPassive Triggers - [FileName]Listener")
						.addField("Example","I am looking for a modifier, I'll type [condition] after the name of the modifier.")
						.setAuthor(`Created with Professor Ryze's Bug System`)
						.setThumbnail(message.author.avatarURL)
						.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
						.setTimestamp()
					message.channel.send(embed);
					break;
				default:
					readdirp({ root: './GitHubDownload', fileFilter: '*.java'}, function (errors, res) {
							if (errors) {
									errors.forEach(function (err) {
										console.error('Error: ', err);
									});
							}
							var datastring = "Empty";

							var goodGuesses = 0;
							var foundWord = false;
							var guessName = [];
							var guessPath = [];

							var skipRest = false;

							var embed = new Discord.RichEmbed()
								.setTitle(`File Links Found`)
								.setThumbnail(message.author.avatarURL)
								.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
								.setTimestamp()

							Object.keys(res.files).forEach(function(id) {
									var name = res.files[id]['name'];
									var path = res.files[id]['path'];
									if (name.toLowerCase() == `${args[1].toLowerCase()}.java`) {
										if (datastring == "Empty") datastring = "$|$";
										foundWord = true;
										if (path.includes("MSRepo")) {
											var newPath = path.replace("MSRepo","");
											embed.addField(name,`https://github.com/TheComputerGeek2/MagicSpells/blob/master/${newPath}\n`)
										} else {
											var newPath = path.replace("EffRepo","");
											embed.addField(name,`https://github.com/Slikey/EffectLib/blob/master/${newPath}\n`)
										}
										statsJS.incrementFetchData(message.author.id, name);
									} else {
										var score = compareAndScore(`${args[1].toLowerCase()}.java`, name.toLowerCase());
										if (score == 1) {
											skipRest = true;
											guessName = [];
											guessPath = [];
											guessName.push(name);
											guessPath.push(path);
										}
										if (score >= 0.5 && skipRest != true) {
											guessName.push(name);
											guessPath.push(path);
										}
									}
							})

							if (foundWord == false) {
								for (i = 0; i < guessName.length; i++) {
									var name = guessName[i];
									var path = guessPath[i];
									if (path.includes("MSRepo")) {
										var newPath = path.replace("MSRepo","");
										embed.addField(name,`https://github.com/TheComputerGeek2/MagicSpells/blob/master/${newPath}\n`)
									} else {
										var newPath = path.replace("EffRepo","");
										embed.addField(name,`https://github.com/Slikey/EffectLib/blob/master/${newPath}\n`)
									}
									goodGuesses++;
									statsJS.incrementFetchData(message.author.id, name);
								}
							}

							if (datastring == "Empty") {
								if (goodGuesses > 0) {
									embed.setDescription("I couldn't get an exact match but here are some similar links")
									embed.setTitle("Similar File Links Found")
								}
								else {
									message.react(emojiDB.react("cross"))
									return message.channel.send("No Files Found!")
								}
							}

							datastring = datastring.replace("$|$","");
							message.channel.send(embed);
							if (goodGuesses > 0) message.react(emojiDB.react("thinking"))
							else message.react(emojiDB.react("tick"))
					});
					break;
			}
	},
	fetchAll: (client, message, args) => {
		//Perfectly Funtioning
		switch (args[1].toLowerCase())
			{
				case "guide":
					var embed = new Discord.RichEmbed()
						.setTitle(`Guide to using FetchAll Efficiently`)
						.addField("KeyWords","This is ment to bring a list of all available modifiers, spells and so on. Add a keyword after ~fetchall [keyword] to use it.\nAvailable Keywords are \ninstant, targeted, buff, command, passive, modifier, effLib, effMS")
						.addField("Example","I am looking for all modifiers, I'll type ~fetchall modifier")
						.setAuthor(`Created with Professor Ryze's Fetch System`)
						.setThumbnail(message.author.avatarURL)
						.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
						.setTimestamp()
					message.channel.send(embed);
					break;
				case "instant":
					readdirp({ root: './GitHubDownload/srcMSRepo/com/nisovin/magicspells/spells/instant', fileFilter: '*.java'}, function (errors, res) {
							if (errors) {
									errors.forEach(function (err) {
										console.error('Error: ', err);
									});
							}
							var array = [];
							var sizeOfField = 10;

							Object.keys(res.files).forEach(function(id) {
									var name = res.files[id]['name'];
									array.push(`${name.replace(".java","")}`);
							})

							var totalFields = Math.ceil(array.length / sizeOfField);

							var embed = new Discord.RichEmbed()
								.setTitle("All Instant Spells")
								.setThumbnail(message.author.avatarURL)
								.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
								.setTimestamp()
								for (i = 0; i < totalFields; i++) {
									var tempArray = [];
									for (j = 0 + i * sizeOfField; j < sizeOfField + i * sizeOfField; j++) {
										tempArray.push(array[j]);
									}
									embed.addField(`Set ${i}`, tempArray, true);
								}
								embed.addField(`I've counted **${array.length}** entries`,"Quite the number")
							message.channel.send(embed);
							message.react(emojiDB.react("tick"))
					});
					break;
				case "targeted":
					readdirp({ root: './GitHubDownload/srcMSRepo/com/nisovin/magicspells/spells/targeted', fileFilter: '*.java'}, function (errors, res) {
							if (errors) {
									errors.forEach(function (err) {
										console.error('Error: ', err);
									});
							}
							var array = [];
							var sizeOfField = 10;

							Object.keys(res.files).forEach(function(id) {
									var name = res.files[id]['name'];
									array.push(`${name.replace(".java","")}`);
							})

							var totalFields = Math.ceil(array.length / sizeOfField);

							var embed = new Discord.RichEmbed()
								.setTitle("All Targeted Spells")
								.setThumbnail(message.author.avatarURL)
								.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
								.setTimestamp()
								for (i = 0; i < totalFields; i++) {
									var tempArray = [];
									for (j = 0 + i * sizeOfField; j < sizeOfField + i * sizeOfField; j++) {
										tempArray.push(array[j]);
									}
									embed.addField(`Set ${i}`, tempArray, true);
								}
								embed.addField(`I've counted **${array.length}** entries`,"Quite the number")
							message.channel.send(embed);
							message.react(emojiDB.react("tick"))
					});
					break;
				case "buff":
					readdirp({ root: './GitHubDownload/srcMSRepo/com/nisovin/magicspells/spells/buff', fileFilter: '*.java'}, function (errors, res) {
							if (errors) {
									errors.forEach(function (err) {
										console.error('Error: ', err);
									});
							}
							var array = [];
							var sizeOfField = 10;

							Object.keys(res.files).forEach(function(id) {
									var name = res.files[id]['name'];
									array.push(`${name.replace(".java","")}`);
							})

							var totalFields = Math.ceil(array.length / sizeOfField);

							var embed = new Discord.RichEmbed()
								.setTitle("All Buff Spells")
								.setThumbnail(message.author.avatarURL)
								.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
								.setTimestamp()
								for (i = 0; i < totalFields; i++) {
									var tempArray = [];
									for (j = 0 + i * sizeOfField; j < sizeOfField + i * sizeOfField; j++) {
										tempArray.push(array[j]);
									}
									embed.addField(`Set ${i}`, tempArray, true);
								}
								embed.addField(`I've counted **${array.length}** entries`,"Quite the number")
							message.channel.send(embed);
							message.react(emojiDB.react("tick"))
					});
					break;
				case "command":
					readdirp({ root: './GitHubDownload/srcMSRepo/com/nisovin/magicspells/spells/command', fileFilter: '*.java'}, function (errors, res) {
							if (errors) {
									errors.forEach(function (err) {
										console.error('Error: ', err);
									});
							}
							var array = [];
							var sizeOfField = 10;

							Object.keys(res.files).forEach(function(id) {
									var name = res.files[id]['name'];
									array.push(`${name.replace(".java","")}`);
							})

							var totalFields = Math.ceil(array.length / sizeOfField);

							var embed = new Discord.RichEmbed()
								.setTitle("All Command Spells")
								.setThumbnail(message.author.avatarURL)
								.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
								.setTimestamp()
								for (i = 0; i < totalFields; i++) {
									var tempArray = [];
									for (j = 0 + i * sizeOfField; j < sizeOfField + i * sizeOfField; j++) {
										tempArray.push(array[j]);
									}
									embed.addField(`Set ${i}`, tempArray, true);
								}
								embed.addField(`I've counted **${array.length}** entries`,"Quite the number")
							message.channel.send(embed);
							message.react(emojiDB.react("tick"))
					});
					break;
					case "passive":
						readdirp({ root: './GitHubDownload/srcMSRepo/com/nisovin/magicspells/spells/passive', fileFilter: '*.java'}, function (errors, res) {
								if (errors) {
										errors.forEach(function (err) {
											console.error('Error: ', err);
										});
								}
								var array = [];
								var sizeOfField = 10;

								Object.keys(res.files).forEach(function(id) {
										var name = res.files[id]['name'];
										array.push(`${name.replace(".java","")}`);
								})

								var totalFields = Math.ceil(array.length / sizeOfField);

								var embed = new Discord.RichEmbed()
									.setTitle("All Passive Listeners")
									.setThumbnail(message.author.avatarURL)
									.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
									.setTimestamp()
									for (i = 0; i < totalFields; i++) {
										var tempArray = [];
										for (j = 0 + i * sizeOfField; j < sizeOfField + i * sizeOfField; j++) {
											tempArray.push(array[j]);
										}
										embed.addField(`Set ${i}`, tempArray, true);
									}
									embed.addField(`I've counted **${array.length}** entries`,"Quite the number")
								message.channel.send(embed);
								message.react(emojiDB.react("tick"))
						});
						break;
					case "modifier":
						readdirp({ root: './GitHubDownload/srcMSRepo/com/nisovin/magicspells/castmodifiers/conditions', fileFilter: '*.java'}, function (errors, res) {
								if (errors) {
										errors.forEach(function (err) {
											console.error('Error: ', err);
										});
								}
								var array = [];
								var sizeOfField = 10;

								Object.keys(res.files).forEach(function(id) {
										var name = res.files[id]['name'];
										array.push(`${name.replace(".java","")}`);
								})

								var totalFields = Math.ceil(array.length / sizeOfField);

								var embed = new Discord.RichEmbed()
									.setTitle("All Modifier Conditions")
									.setThumbnail(message.author.avatarURL)
									.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
									.setTimestamp()
									for (i = 0; i < totalFields; i++) {
										var tempArray = [];
										for (j = 0 + i * sizeOfField; j < sizeOfField + i * sizeOfField; j++) {
											tempArray.push(array[j]);
										}
										embed.addField(`Set ${i}`, tempArray, true);
									}
									embed.addField(`I've counted **${array.length}** entries`,"Quite the number")
								message.channel.send(embed);
								message.react(emojiDB.react("tick"))
						});
						break;
					case "efflib":
						readdirp({ root: './GitHubDownload/srcEffRepo/main/java/de/slikey/effectlib/effect', fileFilter: '*.java'}, function (errors, res) {
								if (errors) {
										errors.forEach(function (err) {
											console.error('Error: ', err);
										});
								}
								var array = [];
								var sizeOfField = 10;

								Object.keys(res.files).forEach(function(id) {
										var name = res.files[id]['name'];
										array.push(`${name.replace(".java","")}`);
								})

								var totalFields = Math.ceil(array.length / sizeOfField);

								var embed = new Discord.RichEmbed()
									.setTitle("All Effectlib Effects")
									.setThumbnail(message.author.avatarURL)
									.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
									.setTimestamp()
									for (i = 0; i < totalFields; i++) {
										var tempArray = [];
										for (j = 0 + i * sizeOfField; j < sizeOfField + i * sizeOfField; j++) {
											tempArray.push(array[j]);
										}
										embed.addField(`Set ${i}`, tempArray, true);
									}
									embed.addField(`I've counted **${array.length}** entries`,"Quite the number")
								message.channel.send(embed);
								message.react(emojiDB.react("tick"))
						});
						break;
					case "effms":
						readdirp({ root: './GitHubDownload/srcMSRepo/com/nisovin/magicspells/spelleffects', fileFilter: '*.java'}, function (errors, res) {
								if (errors) {
										errors.forEach(function (err) {
											console.error('Error: ', err);
										});
								}
								var array = [];
								var sizeOfField = 10;

								Object.keys(res.files).forEach(function(id) {
										var name = res.files[id]['name'];
										array.push(`${name.replace(".java","")}`);
								})

								var totalFields = Math.ceil(array.length / sizeOfField);

								var embed = new Discord.RichEmbed()
									.setTitle("All MagicSpells Effects")
									.setThumbnail(message.author.avatarURL)
									.setFooter("Maintained by Rifle D. Luffy#1852", "https://i.imgur.com/zEOYDNJ.png")
									.setTimestamp()
									for (i = 0; i < totalFields; i++) {
										var tempArray = [];
										for (j = 0 + i * sizeOfField; j < sizeOfField + i * sizeOfField; j++) {
											tempArray.push(array[j]);
										}
										embed.addField(`Set ${i}`, tempArray, true);
									}
									embed.addField(`I've counted **${array.length}** entries`,"Quite the number")
								message.channel.send(embed);
								message.react(emojiDB.react("tick"))
						});
						break;
				default:
					return message.reply("Must choose one of these parameters to fetch.\n\ninstant\ntargeted\nbuff\ncommand\npassive\nmodifier")
			}
	}
}
