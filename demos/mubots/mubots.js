// Sub Pallette
// Background light blue - 20
// White - 21
// Dark Blue - 1

var init = function() {
	state = "menu";
	player = Bot.create({ "name": "Player", "attack": 5, "health": 20, "speed": 3, "sprite": 32 });
//	player.evasion = 0.5;
	enemy = Bot.create({ "attack": 2, "health": 16, "speed": 2, "sprite": 16 });
};

var update = function() {
	switch(state) {
		case "menu":
			if (Hestia.buttonUp(4) || Hestia.buttonUp(5)) {
				state = "battle";
				battleState = BattleState.BATTLE_INTRO;
				timeInBattleState = 0;
				battleText = "Prepare to be destroyed!";
				textIndex = 0;
			}
			break;
		case "battle":
			// Do some battle stuff
			updateBattle();
			break;
	}
};

var updateBattle = function() {
	timeInBattleState++;
	// Because this isn't a proper SM, we're having to call the 'enter'
	// code under the case for the exiting state 
	switch(battleState) {
		case BattleState.BATTLE_INTRO:
			if (textIndex >= battleText.length) {
				if (Hestia.buttonUp(4) || Hestia.buttonUp(5)) {
					timeInBattleState = 0;
					battleState = BattleState.PLAYER_INPUT;
				}
			} else if (Hestia.buttonUp(4) || Hestia.buttonUp(5)) {
				textIndex = battleText.length;
			} else {
				textIndex++;
				if (battleText[textIndex] == " ") {
					textIndex++;
				}
			}
			break;
		case BattleState.PLAYER_INPUT:
			if (Hestia.buttonUp(4) || Hestia.buttonUp(5)) {
				// Attack!
				timeInBattleState = 0;
				battleState = BattleState.FIRST_ATTACK;
				if (player.speed >= enemy.speed) {
					Bot.attack(player, enemy);
				} else {
					Bot.attack(enemy, player);
				}
			}
			break;
		case BattleState.FIRST_ATTACK:
			if (timeInBattleState > 120) {
				timeInBattleState = 0;
				battleState = BattleState.SECOND_ATTACK;
				if (player.speed >= enemy.speed) {
					if (enemy.health > 0) {
						Bot.attack(enemy, player);						
					} else {
						battleState = BattleState.OVER;
						timeInBattleState = 0;
					}
				} else {
					if (player.health > 0) {
						Bot.attack(player, enemy);						
					} else {
						battleState = battleState.OVER;
						timeInBattleState = 0;
					}
				}
			}
			break;
		case BattleState.SECOND_ATTACK:
			if (timeInBattleState > 120) {
				timeInBattleState = 0;
				if (player.health == 0 || enemy.health == 0) {
					battleState = BattleState.OVER;
				} else {
					battleState = BattleState.PLAYER_INPUT;
				}
			}
			break;
		case BattleState.OVER:
			if (timeInBattleState > 240 || Hestia.buttonUp(4) || Hestia.buttonUp(5)) {
				battleState = BattleState.BATTLE_INTRO;
				timeInBattleState = 0;
				state = "menu";
				player.health = player.maxHealth;
				enemy.health = enemy.maxHealth;
			}
			break;
	}
};

var draw = function() {
	Hestia.clear(20);
	switch(state) {
		case "menu":
			Hestia.drawText("muBots", 80 - 10, 32, 1); // TODO: Bigger Font
			// TODO: Centering options on the UI functions would be nice...
			// Hestia.UI utils? would also be nice to keep the base API clean
			Hestia.drawText("Press Z / X", 80-22, 100, 1);
			Hestia.drawText("to Battle", 80-18, 100+6, 1);
			break;
		case "battle":
			drawBattle();
			break;
	}
};

var drawBattle = function() {
	Hestia.drawSprite(player.sprite, 20, 80);
	Hestia.drawText(player.name + ": " + player.health + "/" + player.maxHealth, 20+8+8, 80+2, 1); // screen padding + sprite size + text padding
	Hestia.drawSprite(enemy.sprite, 20, 20);
	var botText = enemy.name + ": " + enemy.health + "/" + enemy.maxHealth;
	Hestia.drawText(botText, 20+8+8, 20+2, 1); // screen padding + sprite size + text padding
	switch(battleState) {
		case BattleState.BATTLE_INTRO:
			var text = battleText.substr(0, Math.floor(timeInBattleState / textReadSpeed));
			Hestia.drawText(
				text, 
				20+8+8,
				20+2+6+2,
				1);
			break;
		case BattleState.PLAYER_INPUT:
			Hestia.drawText(
				"Attack?",
				20+8+8,
				80+2+6+2,
				1);
			break;
		case BattleState.FIRST_ATTACK:
		case BattleState.SECOND_ATTACK:
			var sourceY, targetY;
			if (Bot.attackResult.source == player) {
				sourceY = 80+2+6+2;
				targetY = 20+2+6+2;
			} else {
				sourceY = 20+2+6+2;
				targetY = 80+2+6+2;
			}
			switch(Bot.attackResult.outcome) {
				case "miss":
					Hestia.drawText(Bot.attackResult.source.name + " missed", 20+8+8, sourceY, 1);		
					break;
				case "dodge":
					Hestia.drawText(Bot.attackResult.source.name + " attacked", 20+8+8, sourceY, 1);
					Hestia.drawText(Bot.attackResult.target.name + " dodged", 20+8+8, targetY, 1);
					break;
				default:
					Hestia.drawText(Bot.attackResult.source.name + " " + Bot.attackResult.outcome + " " + Bot.attackResult.target.name, 20+8+8, sourceY, 1);
					Hestia.drawText(Bot.attackResult.target.name + " took " + Bot.attackResult.damage + " damage", 20+8+8, targetY, 1);
					break;
			}
			break;
		case BattleState.OVER:
			if (player.health > 0) {
				Hestia.drawText("Oh no!", 20+8+8, 20+2+6+2, 1);
			} else {
				Hestia.drawText("Ha ha!", 20+8+8, 20+2+6+2, 1);
			}
			break;
	}
};

var drawPalette = function(x, y, size) {
	var l = Hestia.palette().length;
	for(var i = 0; i < l; i++) {
		Hestia.fillRect(x+i*size,y,size,size,i);
	}
};

var drawCursor = function() {
	var pos = Hestia.mousePosition();
	Hestia.fillRect(pos[0],pos[1],3,2,27);
	Hestia.fillRect(pos[0],pos[1],2,3,27);
	Hestia.setPixel(pos[0]+1,pos[1]+1,21);
};

// State
var BattleState = {
	BATTLE_INTRO: 0,
	PLAYER_INPUT: 1,
	FIRST_ATTACK: 2,
	SECOND_ATTACK: 3,
	OVER: 4,
};

// Game state
var state, battleState, timeInBattleState;
var player, enemy;

// UI State
var battleText, textReadSpeed = 5, textIndex = 0;

// GBC Resolution is 160x144
// Half-HD is 960x540
// Half-Switch is 640x360  
var config = { 
	"width": 160, 
	"height": 144,
	"pixelRatio": 4,
	"tickRate": 60,
	"palette": "/palettes/aseprite.json",
	"spriteSheet": { 
		"path": "images/spriteSheet.png", 
		"spriteSize": 8
	},
	"keys": [ 37, 39, 38, 40, 90, 88], // left, right, up, down, z, x
	"hideCursor": false
};

// Arguably this bit is shared bootstrap, could go full retro console and game.js ^^ could be loaded dynamically 
// https://stackoverflow.com/questions/44803944/can-i-run-a-js-script-from-another-using-fetch
// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
window.onload = function() {
	var canvas = document.getElementById("canvas");
	
	config.update = update;
	config.draw = draw;
	config.canvas = canvas;

	init();

	Hestia.init(config);
	Hestia.run();

	// Offset Canvas as we know it's small
	canvas.setAttribute("style", canvas.getAttribute("style") + "margin-top: 128px;");
};


// Bot class
var Bot = (function(){
	var exports = {};
	var proto = {
		"accuracy": 0.95,
		"criticalRate": 0.05,
		"evasion": 0.05,
		"name": "Bot"
	};

	// TODO: Concept of 'move' as in type of attack with
	// different hit / miss chances, + cooldowns, attack damage

	exports.attackResult = {
		"outcome": "none",
		"damage": 0,
		"source": null,
		"target": null,
	};

	exports.attack = function(source, target) {
		exports.attackResult.damage = 0;
		exports.attackResult.source = source;
		exports.attackResult.target = target;

		var hit = Math.random() < source.accuracy;
		var dodge = Math.random() < target.evasion;
		if (hit && !dodge) {
			exports.attackResult.outcome = "hit";
			var damage = source.attack;
			if (Math.random() < source.criticalRate) {
				exports.attackResult.outcome = "crit";
				damage *= 2;
			}
			exports.attackResult.damage = damage;
			target.health = Math.max(0, target.health - damage);
		} else {
			if (!hit) {
				exports.attackResult.outcome = "miss";
			} else {
				exports.attackResult.outcome = "dodge";
			}
		}
	};

	exports.create = function(parameters) {
		var bot = Object.create(proto);
		
		bot.attack = parameters.attack;
		bot.health = parameters.health;
		bot.maxHealth = parameters.health;
		bot.speed = parameters.speed;
		bot.sprite = parameters.sprite;
		if (parameters.name) {
			bot.name = parameters.name;			
		}

		return bot;
	};

	return exports;
})();


// Text Box 'class'
// Q: Do we really want OO to this level?
// I mean it's part of why we moved to JS so we'd have the option
// the fantasy consoles all quite like minimal memory use / functional style code
// is it worth following that style as a differente way of coding for practice?
// rather than reinventing Unity every place we go?
var TextBox = (function(){
	var proto = {
		padding: 3,
		spacing: 1,
		index: 0,
		select: false,
		boxed: true,
		charWidth: 4,	// Technically this comes from font but only one font atm
		charHeight: 6,	// ^^ as above
		color: 0,
		bgColor: 21,
		draw: function() {
			var indent = 0;
			if (this.select) {
				indent = 4;
			}

			var x = this.x, y = this.y, w = this.w, h = this.h,
				padding = this.padding, spacing = this.spacing, lines = this.lines,
				select = this.select, index = this.index, c = this.color, charHeight = this.charHeight;

			if (this.boxed) {
				Hestia.fillRect(x+1,y+1,w-2,h-2, this.bgColor);
				Hestia.drawRect(x, y, w, h, c);					
			}
			
			for(var i = 0; i < lines.length; i++) {
				Hestia.drawText(lines[i], x+padding + indent, y + padding + (spacing + charHeight)*i, c);
				
				if (select && i == index) {
					var px = x + padding;
					var py = y + padding + (charHeight + spacing) * i + 2;
					Hestia.setPixel(px, py, c);
					Hestia.setPixel(px+1, py, c);
					Hestia.setPixel(px, py+1, c);
					Hestia.setPixel(px, py-1, c);
				}
			}		
		},
		update: function() {
			if (this.select) {
				if (Hestia.buttonUp(2)) {
					this.index = (this.index - 1 + this.lines.length) % this.lines.length;
				}
				if (Hestia.buttonUp(3)) {
					this.index = (this.index + 1) % this.lines.length;
				}
			}
		},
		recalculateDimensions: function() {
			this.w = this.calculateMinWidth();
			this.h = this.calculateMinHeight();
		},
		calculateMinWidth: function() {
			var indent = 0;
			if (this.select) {
				indent = 3;
			}
			var maxWidth = 0;
			for(var i = 0; i < this.lines.length; i++) {
				if (this.lines[i].length > maxWidth) {
					maxWidth = this.lines[i].length;
				}
			}			
			return this.charWidth * maxWidth + 2 * this.padding + indent;
		},
		calculateMinHeight: function() {
			return 2 * this.padding + this.lines.length*(this.charHeight+this.spacing) - (this.spacing+1);
		}
	};

	// Could probably take parameters object as it's a create
	var create = function(x, y, lines, color, bgColor, select) {
		var textBox = Object.create(proto);
		textBox.x = x;
		textBox.y = y;
		textBox.lines = lines;
		textBox.color = color;
		textBox.bgColor = bgColor;
		textBox.select = select;
		textBox.recalculateDimensions();
		return textBox;
	};

	return { create: create };
})();