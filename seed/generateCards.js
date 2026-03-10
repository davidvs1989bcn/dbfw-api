// ============================================
// Generador de cartas adicionales para el seed
// Genera un JSON extendido combinando las cartas manuales
// con cartas generadas a partir de patrones conocidos
//
// Uso: node seed/generateCards.js
// Genera: seed/cards_data_full.json
// ============================================
const fs = require('fs');
const path = require('path');

const BASE_IMG = 'https://www.dbs-cardgame.com/fw/images/cards/card/en';

// Cartas conocidas con datos reales (FB03-FB09 líderes + cartas clave)
const EXTRA_CARDS = [
  // ===== FB03 - RAGING ROAR =====
  {id:"FB03-001",code:"FB03-001",name:"Son Goku",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Universe 7",effect:"[When Attacking] If your opponent has 1 or more Battle Cards, draw 1 card.\n[Awaken] When your life is at 4 or less, draw 2 cards. Then, flip this card over.",set_id:"fb03"},
  {id:"FB03-002",code:"FB03-002",name:"Son Goku : SS",card_type:"BATTLE",color:"Red",rarity:"C",cost:"1",specified_cost:"-",power:"5000",combo_power:"10000",features:"Saiyan/Universe 7",effect:"",set_id:"fb03"},
  {id:"FB03-003",code:"FB03-003",name:"Son Goku : SS2",card_type:"BATTLE",color:"Red",rarity:"R",cost:"3",specified_cost:"1",power:"20000",combo_power:"10000",features:"Saiyan/Universe 7",effect:"[Critical]\n[When Attacking] Draw 1 card.",set_id:"fb03"},
  {id:"FB03-004",code:"FB03-004",name:"Son Goku : SS3",card_type:"BATTLE",color:"Red",rarity:"SR",cost:"5",specified_cost:"2",power:"30000",combo_power:"10000",features:"Saiyan/Universe 7",effect:"[Double Strike]\n[When Attacking] Draw 1 card and this card gets +10000 power for the duration of the battle.",set_id:"fb03"},
  {id:"FB03-005",code:"FB03-005",name:"Ultimate Gohan",card_type:"BATTLE",color:"Red",rarity:"SR",cost:"5",specified_cost:"2",power:"30000",combo_power:"10000",features:"Saiyan/Earthling/Universe 7",effect:"[Double Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards with a cost of 2 or less and KO them.",set_id:"fb03"},
  {id:"FB03-006",code:"FB03-006",name:"Gotenks : SS3",card_type:"BATTLE",color:"Red",rarity:"SCR",cost:"7",specified_cost:"3",power:"40000",combo_power:"-",features:"Saiyan/Universe 7",effect:"[Triple Strike]\n[On Play] Choose up to 1 of your opponent's Battle Cards and KO it. Draw 2 cards.",set_id:"fb03"},
  {id:"FB03-007",code:"FB03-007",name:"Videl",card_type:"BATTLE",color:"Red",rarity:"C",cost:"1",specified_cost:"-",power:"5000",combo_power:"10000",features:"Earthling/Universe 7",effect:"",set_id:"fb03"},
  {id:"FB03-008",code:"FB03-008",name:"Gotenks",card_type:"BATTLE",color:"Red",rarity:"UC",cost:"3",specified_cost:"-",power:"20000",combo_power:"10000",features:"Saiyan/Universe 7",effect:"[On Play] Draw 1 card.",set_id:"fb03"},
  {id:"FB03-009",code:"FB03-009",name:"Goten",card_type:"BATTLE",color:"Red",rarity:"C",cost:"2",specified_cost:"-",power:"10000",combo_power:"10000",features:"Saiyan/Earthling/Universe 7",effect:"",set_id:"fb03"},
  {id:"FB03-010",code:"FB03-010",name:"Trunks : Kid",card_type:"BATTLE",color:"Red",rarity:"C",cost:"2",specified_cost:"-",power:"10000",combo_power:"10000",features:"Saiyan/Earthling",effect:"",set_id:"fb03"},
  {id:"FB03-011",code:"FB03-011",name:"Majin Buu : Good",card_type:"BATTLE",color:"Red",rarity:"R",cost:"4",specified_cost:"1",power:"25000",combo_power:"10000",features:"Majin",effect:"[On Play] Choose up to 1 of your opponent's Battle Cards with a cost of 3 or less and KO it.",set_id:"fb03"},
  {id:"FB03-012",code:"FB03-012",name:"Super Saiyan Rage",card_type:"EXTRA",color:"Red",rarity:"UC",cost:"2",specified_cost:"-",power:"-",combo_power:"-",features:"",effect:"[Activate: Main] Choose up to 1 of your Battle Cards and it gets +10000 power for the duration of the turn.",set_id:"fb03"},
  {id:"FB03-013",code:"FB03-013",name:"Son Goku",card_type:"ENERGY MARKER",color:"Red",rarity:"C",cost:"-",specified_cost:"-",power:"-",combo_power:"-",features:"Saiyan/Universe 7",effect:"",set_id:"fb03"},

  {id:"FB03-025",code:"FB03-025",name:"Cell : Perfect",card_type:"LEADER",color:"Blue",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Android/Saiyan",effect:"[When Attacking] Draw 1 card, then discard 1 card from your hand.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb03"},
  {id:"FB03-026",code:"FB03-026",name:"Cell Jr.",card_type:"BATTLE",color:"Blue",rarity:"C",cost:"1",specified_cost:"-",power:"5000",combo_power:"10000",features:"Android",effect:"",set_id:"fb03"},
  {id:"FB03-027",code:"FB03-027",name:"Cell : Perfect",card_type:"BATTLE",color:"Blue",rarity:"SR",cost:"6",specified_cost:"2",power:"35000",combo_power:"-",features:"Android/Saiyan",effect:"[Double Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards with 15000 power or less and place them at the bottom of the owner's deck.",set_id:"fb03"},
  {id:"FB03-028",code:"FB03-028",name:"Android 16",card_type:"BATTLE",color:"Blue",rarity:"R",cost:"4",specified_cost:"1",power:"25000",combo_power:"10000",features:"Android/Red Ribbon Army",effect:"[On Play] Choose up to 1 of your opponent's Battle Cards with 20000 power or less and place it at the bottom of the owner's deck.",set_id:"fb03"},

  {id:"FB03-040",code:"FB03-040",name:"Vegeta : SS",card_type:"LEADER",color:"Green",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Universe 7",effect:"[When Attacking] Choose up to 1 of your opponent's Battle Cards and switch it to Rest Mode.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb03"},
  {id:"FB03-041",code:"FB03-041",name:"Trunks : Future",card_type:"BATTLE",color:"Green",rarity:"SR",cost:"5",specified_cost:"2",power:"30000",combo_power:"10000",features:"Saiyan/Earthling",effect:"[Double Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards and switch them to Rest Mode.",set_id:"fb03"},

  {id:"FB03-050",code:"FB03-050",name:"Majin Buu",card_type:"LEADER",color:"Yellow",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Majin",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card and choose up to 1 of your opponent's Battle Cards and KO it. Then, flip this card over.",set_id:"fb03"},
  {id:"FB03-051",code:"FB03-051",name:"Majin Buu : Evil",card_type:"BATTLE",color:"Yellow",rarity:"SR",cost:"5",specified_cost:"2",power:"30000",combo_power:"10000",features:"Majin",effect:"[Double Strike]\n[On Play] Choose up to 1 of your opponent's Battle Cards and KO it.",set_id:"fb03"},
  {id:"FB03-052",code:"FB03-052",name:"Super Buu",card_type:"BATTLE",color:"Yellow",rarity:"SCR",cost:"8",specified_cost:"3",power:"45000",combo_power:"-",features:"Majin",effect:"[Triple Strike]\n[On Play] KO all of your opponent's Battle Cards with a cost of 3 or less.",set_id:"fb03"},
  {id:"FB03-053",code:"FB03-053",name:"Dabura",card_type:"BATTLE",color:"Yellow",rarity:"R",cost:"3",specified_cost:"1",power:"20000",combo_power:"10000",features:"Demon Clan",effect:"[Critical]\n[On Play] Choose up to 1 of your opponent's Battle Cards with a cost of 2 or less and KO it.",set_id:"fb03"},

  // ===== FB04 - ULTRA LIMIT =====
  {id:"FB04-001",code:"FB04-001",name:"Son Goku : Ultra Instinct",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/God/Universe 7",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 2 cards. Then, flip this card over.",set_id:"fb04"},
  {id:"FB04-002",code:"FB04-002",name:"Son Goku : Ultra Instinct -Sign-",card_type:"BATTLE",color:"Red",rarity:"SR",cost:"5",specified_cost:"2",power:"30000",combo_power:"10000",features:"Saiyan/God/Universe 7",effect:"[Double Strike]\n[When Attacking] This card cannot be KO'd during this battle.",set_id:"fb04"},
  {id:"FB04-003",code:"FB04-003",name:"Vegeta : Ultra Ego",card_type:"BATTLE",color:"Red",rarity:"SCR",cost:"7",specified_cost:"3",power:"40000",combo_power:"-",features:"Saiyan/God/Universe 7",effect:"[Triple Strike]\n[When Attacking] Draw 2 cards. Choose up to 1 of your opponent's Battle Cards with a cost of 5 or less and KO it.",set_id:"fb04"},
  {id:"FB04-004",code:"FB04-004",name:"Kefla",card_type:"BATTLE",color:"Red",rarity:"R",cost:"4",specified_cost:"1",power:"25000",combo_power:"10000",features:"Saiyan/Universe 6/Potara",effect:"[Critical]\n[When Attacking] This card gets +10000 power for the duration of the battle.",set_id:"fb04"},
  {id:"FB04-005",code:"FB04-005",name:"Caulifla",card_type:"BATTLE",color:"Red",rarity:"UC",cost:"2",specified_cost:"-",power:"15000",combo_power:"10000",features:"Saiyan/Universe 6",effect:"[On Play] If you have 2 or more energy, draw 1 card.",set_id:"fb04"},
  {id:"FB04-006",code:"FB04-006",name:"Kale : Berserk",card_type:"BATTLE",color:"Red",rarity:"R",cost:"3",specified_cost:"1",power:"20000",combo_power:"10000",features:"Saiyan/Universe 6",effect:"[Critical]\n[On Play] This card gets +10000 power for the duration of the turn.",set_id:"fb04"},

  {id:"FB04-025",code:"FB04-025",name:"Golden Frieza",card_type:"LEADER",color:"Blue",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Frieza Clan/Frieza's Army",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card and choose up to 1 of your opponent's Battle Cards with 15000 power or less and return it to the owner's hand. Then, flip this card over.",set_id:"fb04"},
  {id:"FB04-026",code:"FB04-026",name:"Golden Frieza",card_type:"BATTLE",color:"Blue",rarity:"SCR",cost:"7",specified_cost:"3",power:"40000",combo_power:"-",features:"Frieza Clan/Frieza's Army",effect:"[Triple Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards and place them at the bottom of the owner's deck.",set_id:"fb04"},
  {id:"FB04-027",code:"FB04-027",name:"Frost",card_type:"BATTLE",color:"Blue",rarity:"R",cost:"3",specified_cost:"1",power:"20000",combo_power:"10000",features:"Frieza Clan/Universe 6",effect:"[On Play] Choose up to 1 of your opponent's Battle Cards with 15000 power or less and place it at the bottom of the owner's deck.",set_id:"fb04"},

  {id:"FB04-040",code:"FB04-040",name:"Trunks : Future",card_type:"LEADER",color:"Green",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Earthling",effect:"[When Attacking] Choose up to 1 of your opponent's Battle Cards and switch it to Rest Mode.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb04"},

  {id:"FB04-050",code:"FB04-050",name:"Goku Black : SS Rosé",card_type:"LEADER",color:"Yellow",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/God",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card and choose up to 1 of your opponent's Battle Cards with a cost of 2 or less and KO it. Then, flip this card over.",set_id:"fb04"},
  {id:"FB04-051",code:"FB04-051",name:"Goku Black : SS Rosé",card_type:"BATTLE",color:"Yellow",rarity:"SR",cost:"5",specified_cost:"2",power:"30000",combo_power:"10000",features:"Saiyan/God",effect:"[Double Strike]\n[On Play] Choose up to 1 of your opponent's Battle Cards with a cost of 4 or less and KO it.",set_id:"fb04"},
  {id:"FB04-052",code:"FB04-052",name:"Zamasu : Fused",card_type:"BATTLE",color:"Yellow",rarity:"SCR",cost:"8",specified_cost:"3",power:"45000",combo_power:"-",features:"God/Saiyan/Potara",effect:"[Triple Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards and KO them.",set_id:"fb04"},

  // ===== FB05 - NEW ADVENTURE =====
  {id:"FB05-001",code:"FB05-001",name:"Pan",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Earthling/Universe 7",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card and choose up to 1 of your opponent's Battle Cards and it gets -5000 power for the duration of the turn. Then, flip this card over.",set_id:"fb05"},
  {id:"FB05-002",code:"FB05-002",name:"Son Goku : GT",card_type:"BATTLE",color:"Red",rarity:"SR",cost:"5",specified_cost:"2",power:"30000",combo_power:"10000",features:"Saiyan/Universe 7",effect:"[Double Strike]\n[When Attacking] Draw 1 card. This card gets +5000 power for the duration of the battle.",set_id:"fb05"},
  {id:"FB05-003",code:"FB05-003",name:"Son Goku : SS4",card_type:"BATTLE",color:"Red",rarity:"SCR",cost:"7",specified_cost:"3",power:"40000",combo_power:"-",features:"Saiyan/Great Ape/Universe 7",effect:"[Triple Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards with a cost of 4 or less and KO them. Draw 2 cards.",set_id:"fb05"},
  {id:"FB05-004",code:"FB05-004",name:"Trunks : GT",card_type:"BATTLE",color:"Red",rarity:"R",cost:"3",specified_cost:"1",power:"20000",combo_power:"10000",features:"Saiyan/Earthling",effect:"[Critical]\n[On Play] Draw 1 card.",set_id:"fb05"},
  {id:"FB05-005",code:"FB05-005",name:"Giru",card_type:"BATTLE",color:"Red",rarity:"C",cost:"1",specified_cost:"-",power:"5000",combo_power:"10000",features:"Robot/Machine Mutant",effect:"",set_id:"fb05"},

  {id:"FB05-025",code:"FB05-025",name:"Baby Vegeta",card_type:"LEADER",color:"Blue",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Alien/Machine Mutant",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb05"},
  {id:"FB05-026",code:"FB05-026",name:"Super Baby 2",card_type:"BATTLE",color:"Blue",rarity:"SR",cost:"6",specified_cost:"2",power:"35000",combo_power:"-",features:"Alien/Saiyan/Machine Mutant",effect:"[Double Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards and place them at the bottom of the owner's deck.",set_id:"fb05"},

  {id:"FB05-040",code:"FB05-040",name:"Vegeta : GT",card_type:"LEADER",color:"Green",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Universe 7",effect:"[When Attacking] Choose up to 1 of your opponent's Battle Cards with a cost of 1 or less and switch it to Rest Mode.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb05"},
  {id:"FB05-041",code:"FB05-041",name:"Vegeta : SS4",card_type:"BATTLE",color:"Green",rarity:"SR",cost:"5",specified_cost:"2",power:"30000",combo_power:"10000",features:"Saiyan/Great Ape/Universe 7",effect:"[Double Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards and switch them to Rest Mode.",set_id:"fb05"},

  {id:"FB05-050",code:"FB05-050",name:"Omega Shenron",card_type:"LEADER",color:"Yellow",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Shadow Dragon",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card and choose up to 1 of your opponent's Battle Cards with a cost of 3 or less and KO it. Then, flip this card over.",set_id:"fb05"},
  {id:"FB05-051",code:"FB05-051",name:"Syn Shenron",card_type:"BATTLE",color:"Yellow",rarity:"SR",cost:"6",specified_cost:"2",power:"35000",combo_power:"-",features:"Shadow Dragon",effect:"[Double Strike]\n[On Play] Choose up to 2 of your opponent's Battle Cards with a cost of 3 or less and KO them.",set_id:"fb05"},
  {id:"FB05-052",code:"FB05-052",name:"Gogeta : SS4",card_type:"BATTLE",color:"Yellow",rarity:"SCR",cost:"8",specified_cost:"4",power:"50000",combo_power:"-",features:"Saiyan/Great Ape",effect:"[Triple Strike]\n[On Play] Choose up to 3 of your opponent's Battle Cards and KO them.",set_id:"fb05"},

  // ===== FB06 - RIVALS CLASH =====
  {id:"FB06-001",code:"FB06-001",name:"Bardock",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Bardock's Crew",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 2 cards. Then, flip this card over.",set_id:"fb06"},
  {id:"FB06-025",code:"FB06-025",name:"King Cold",card_type:"LEADER",color:"Blue",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Frieza Clan",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb06"},
  {id:"FB06-040",code:"FB06-040",name:"Piccolo",card_type:"LEADER",color:"Green",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Namekian/Universe 7",effect:"[When Attacking] Choose up to 1 of your opponent's Battle Cards and switch it to Rest Mode.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb06"},
  {id:"FB06-050",code:"FB06-050",name:"Android 21",card_type:"LEADER",color:"Yellow",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Android",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb06"},

  // ===== FB07 - WISH FOR SHENRON =====
  {id:"FB07-001",code:"FB07-001",name:"Son Goku : Childhood",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Earthling",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 2 cards. Then, flip this card over.",set_id:"fb07"},
  {id:"FB07-025",code:"FB07-025",name:"Demon King Piccolo",card_type:"LEADER",color:"Blue",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Namekian/Demon Clan",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb07"},
  {id:"FB07-040",code:"FB07-040",name:"Tien Shinhan",card_type:"LEADER",color:"Green",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Earthling/Universe 7",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb07"},
  {id:"FB07-050",code:"FB07-050",name:"Mercenary Tao",card_type:"LEADER",color:"Yellow",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Earthling/Red Ribbon Army",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb07"},

  // ===== FB08 - SAIYAN'S PRIDE =====
  {id:"FB08-001",code:"FB08-001",name:"Vegeta : SSBE",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/God/Universe 7",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 2 cards. Then, flip this card over.",set_id:"fb08"},
  {id:"FB08-025",code:"FB08-025",name:"Hit",card_type:"LEADER",color:"Blue",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Alien/Universe 6",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fb08"},

  // ===== FB09 - DUAL EVOLUTION =====
  {id:"FB09-001",code:"FB09-001",name:"Gogeta : BR",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 2 cards. Then, flip this card over.",set_id:"fb09"},

  // ===== STARTERS (FS05-FS10) =====
  {id:"FS05-001",code:"FS05-001",name:"Bardock",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Bardock's Crew",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fs05"},
  {id:"FS05-002",code:"FS05-002",name:"Bardock",card_type:"BATTLE",color:"Red",rarity:"C",cost:"2",specified_cost:"-",power:"10000",combo_power:"10000",features:"Saiyan/Bardock's Crew",effect:"",set_id:"fs05"},
  {id:"FS05-003",code:"FS05-003",name:"Fasha",card_type:"BATTLE",color:"Red",rarity:"C",cost:"1",specified_cost:"-",power:"5000",combo_power:"10000",features:"Saiyan/Bardock's Crew",effect:"",set_id:"fs05"},
  {id:"FS05-004",code:"FS05-004",name:"Tora",card_type:"BATTLE",color:"Red",rarity:"C",cost:"2",specified_cost:"-",power:"10000",combo_power:"10000",features:"Saiyan/Bardock's Crew",effect:"",set_id:"fs05"},
  {id:"FS05-005",code:"FS05-005",name:"Shugesh",card_type:"BATTLE",color:"Red",rarity:"C",cost:"1",specified_cost:"-",power:"5000",combo_power:"10000",features:"Saiyan/Bardock's Crew",effect:"",set_id:"fs05"},
  {id:"FS05-006",code:"FS05-006",name:"Borgos",card_type:"BATTLE",color:"Red",rarity:"C",cost:"1",specified_cost:"-",power:"5000",combo_power:"10000",features:"Saiyan/Bardock's Crew",effect:"",set_id:"fs05"},

  {id:"FS06-001",code:"FS06-001",name:"Son Goku",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Universe 7",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fs06"},
  {id:"FS07-001",code:"FS07-001",name:"Vegeta",card_type:"LEADER",color:"Green",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Universe 7",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fs07"},
  {id:"FS08-001",code:"FS08-001",name:"Vegeta : SS3",card_type:"LEADER",color:"Green",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Universe 7",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fs08"},
  {id:"FS09-001",code:"FS09-001",name:"Shallot",card_type:"LEADER",color:"Red",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Adventure",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fs09"},
  {id:"FS10-001",code:"FS10-001",name:"Giblet",card_type:"LEADER",color:"Blue",rarity:"L",cost:"-",specified_cost:"-",power:"15000",combo_power:"-",features:"Saiyan/Wicked Soul",effect:"[When Attacking] Draw 1 card.\n[Awaken] When your life is at 4 or less, draw 1 card. Then, flip this card over.",set_id:"fs10"},
];

// Generar image URLs
const addImageUrls = (cards) => {
  return cards.map(card => {
    if (!card.image_url) {
      const suffix = card.card_type === 'LEADER' ? '_f' : '';
      card.image_url = `${BASE_IMG}/${card.id}${suffix}.webp`;
    }
    return card;
  });
};

// Leer datos existentes y combinar
const existingPath = path.join(__dirname, 'cards_data.json');
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

const existingIds = new Set(existing.cards.map(c => c.id));
const newCards = addImageUrls(EXTRA_CARDS).filter(c => !existingIds.has(c.id));

const combined = {
  sets: existing.sets,
  cards: [...existing.cards, ...newCards]
};

// Guardar
const outputPath = path.join(__dirname, 'cards_data.json');
fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2), 'utf8');

console.log(`✅ Seed actualizado!`);
console.log(`   Cartas existentes: ${existing.cards.length}`);
console.log(`   Cartas nuevas añadidas: ${newCards.length}`);
console.log(`   Total: ${combined.cards.length} cartas`);
console.log(`   Sets: ${combined.sets.length}`);
