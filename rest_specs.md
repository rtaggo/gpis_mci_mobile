# GPIS MCI Mobile App REST Specs

## Authentification
`POST <BASE_SERVER_URL>/connexion.php`

**Request body**
```json
{ 
  "login": "[nom utilisateur]", 
  "password": "[mot de passe]"
}
```

**Example**
```json
{ 
  "login": "john", 
  "password": "doe"
}
```

**Request response**
```json
{
  "authentification" : "booléan indiquant si l'authentification est correct: true | false",
  "role": "Rôle associé à l'utilisateur: india | charly | alpha",
  "first_connexion" : "booléan indiquant si c'est la première connexion: true | false",
  "structure" : "booléan indiquant si la structure du mot de passe répond aux contraintes",
  "token": "<TOKEN> pour plus tard utiliser les headers des requetes" 
}
```

**Example**
```json
{
  "authentification" : true,
  "role": "india",
  "first_connexion" : false,
  "structure" : true
}
```

## Premiere connexion -> enregistrer un nouveau mot de passe
`GET <BASE_SERVER_URL>/save_password.php`

**Request body**
```json
{ 
  "login": "[nom utilisateur]", 
  "password": "[mot de passe]"
}
```
**Example**
```json
{ 
  "login": "john", 
  "password": "Piko123*"
}
```

**Request response**
```json
{
  "authentification" : "booléan indiquant si l'authentification est correct: true | false",
  "structure": "booléan indiquant si la structure du mot de passe répond aux contraintes"  
}
```

**Example**
```json
{
  "authentification" : true,
  "structure": true
}
```

## Patrouilles
`GET <BASE_SERVER_URL>/patrouilles.php`

**Request response**
```json
{
  "patrouilles": ["tableau des patrouilles"] 
}
```

**Example**
```json
{
  "patrouilles": [
    {"name": "GOLF 03", "id": 3},
    {"name": "GOLF 11", "id": 11},
    {"name": "GOLF 14", "id": 14}
  ]
}
```

## Chefs de groupe
`GET <BASE_SERVER_URL>/chefs_groupe.php?chef_connected=<login>`

**Request response**
```json
{
  "code" : 200,
  "chefs_groupe": ["tableau des chefs de groupe"] 
}
```


## Libérer Patrouilles
`GET <BASE_SERVER_URL>/liberer_patrouille.php`

**Request response**
```json
{
  "code": 200
}
```

**Example**

`GET <BASE_SERVER_URL>/liberer_patrouille.php?patrouille=55`

## Déclarer la fin de vacation
`GET <BASE_SERVER_URL>/fin_vacation.php`

**Request response**
```json
{
  "code": 200
}
```

## Sous-secteurs
`GET <BASE_SERVER_URL>/sous_secteurs.php`

**Request response**
```json
{
  "sous-secteurs"  : ["tableau des sous-secteurs de la patrouille"] 
}
```
**Example**
```json
{
  "sous-secteurs"  : [    
    {"name": " EST-01 ",    "id": 3},    
    {"name": " EST-02",     "id": 11},   
    {"name": " EST-03",     "id": 14}  
  ]  
}
```


## secteurs
`GET <BASE_SERVER_URL>/secteurs.php`

**Request response**
```json
{
  "secteurs"  : ["tableau des secteurs"]  
}
```
**Example**
```json
{
  "secteurs"  : ["Nord", "Sud", "Est"]
}
```

## Patrimoine Sous secteur
`GET <BASE_SERVER_URL>/patrimoine_sous_secteur.php?patrouille=<idpatrouille>&sssecteurs=<Liste des secteurs>`

**Example**

`GET <BASE_SERVER_URL>/patrimoine_sous_secteur.php?patrouille=3&sssecteurs=3,11,14`

**Request response**
```json
{
	"code"  : 200,
	"patrimoine"  : {
		"type": "FeatureCollection",
		"features": [..]
	},
	"sous-secteur" : {
		"type": "FeatureCollection",
		"features": [..]
	}
}
```

## Mission Sous secteur
`GET <BASE_SERVER_URL>/misson_sous_secteur.php?patrouille=<idpatrouille>`

**Request response**
```json
{
  "code": "200 | 300 (200: ok, 300:ko)",
  "message": "<message erreur si 300>",
  "mission": "<geojson de la mission>"
}
```

## MaJ Mission
`POST <BASE_SERVER_URL>/maj_mission.php`

**Request body**
```json
{
  "mission_id": "Identifiant de la mission",
  "code" : "Code de l'action: 1 | 3 | 5"
}
```

**Request response**
```json
{
  "code": "200 | 300 (200: ok, 300:ko)",
  "message": "<message erreur si 300>"
}
```

## Statut Mission
`GET <BASE_SERVER_URL>/statut_mission.php?mission=<id mission>&patrouille=<id patrouille>`

**Request response**
```json
{
  "code": "200 | 300 (200: ok, 300:ko)",
  "statut": "<message>"
}
```

## Vérification sous secteur de la mission reçue
`GET <BASE_SERVER_URL>/verification_sous_secteurs.php?mission=<id mission>&sssecteurs=<liste sssecteurs>`

**Request response**
```json
{
  "code": "200 | 300 (200: ok, 300:ko)",
  "verification_sous_secteur": "booléan indiquant si la mission est dans le(s) sous secteur(s) de la patrouille connectée"
}
```

## Reception information sur la mission renfort
`GET <BASE_SERVER_URL>/renforts.php?mission=<id mission>&patrouille=<id patrouille>`

**Request response**
```json
{
  "code": "200 | 300 (200: ok, 300:ko)",
  "renfort": "liste des patrouilles renforts (si mission reçue en leader) ou la patrouille leader (si mission reçue en renfort)"
}
```

## Chrono Mission Pause
`GET <BASE_SERVER_URL>/pause.php?id_patrouille=<id patrouille>`

**Request response**
```json
{
  "code": "200 | 300 (200: ok, 300:ko)",
  "fin_pause": "booléan indiquant si la pause est finie ou non"
}
```
`POST <BASE_SERVER_URL>/pause.php`
Enregistrement du début de la pause 
**Request body**
```json
{
  "id_patrouille": "Identifiant de la patrouille",
}
```

## signalement.php
`GET <BASE_SERVER_URL>/signalement.php`

**Request response**
```json
{
  "types_signalement": "[list des types de signalement]",
  "types_lieux":  "[list des types de lieu]"
}
```

`POST <BASE_SERVER_URL>/signalement.php`

**Request body**
```json
{
  "mission_id": "Identifiant de la mission",
  "type_signalement": "id",
  "type_lieux":  "id"
}
```


## Réaffectation
`GET <BASE_SERVER_URL>/reaffectation.php?signalement=<id signalement>`

**Request response**
```json
{
  "... ensemble des infos de la mission"
}
```

`POST/reaffectation.php`

**Request body**
```json
{
  "signalement" : "id signalement",
  "photo": "String png base64 si modif"
}
```

**Request response**
```json
{
  "code": "200 | 300 (200: ok, 300:ko)",
  "message": "<message erreur si 300>"
}
```

## Incidente en mode lecture seulement
`GET <BASE_SERVER_URL>/incidente.php?incidente_id=<id incidente>`

**Request response**
```json
{
  "code": "200 | 300 (200: ok, 300:ko)",
  "incidente":  "feature décrivant l'incidente"
}
```

## Voisinage
`GET /voisinage.php?patrouille=<idpatrouille>&sssecteurs=<Liste des sssecteurs>`
ou 
`GET /voisinage.php?chefs_groupe=<chefs_groupe>&secteurs=<Liste des secteurs>`

**Example**

`GET <BASE_SERVER_URL>/voisinage.php?patrouille=<idpatrouille>&sssecteurs=3,11,14`

**Request response**
```json
{
  "code": 200,
  "sous-secteur": "<geojson du ou des sous-secteurs>",
  "mission_ronde": "<geojson des derniers positionnements des patrouilles>",
  "chef_groupe": "<geojson des chefs de groupe déclarés mais non associés à une mission : donc sur centroïde du ou des secteurs>"
}
```

## Patrimoine Secteur
`GET <BASE_SERVER_URL>/patrimoine_secteur.php?secteurs=<Liste des secteurs>`

**Example**

`GET <BASE_SERVER_URL>/patrimoine_secteur.php?secteurs='EST'`

**Request response**
```json
{
	"code"  : 200,
	"patrimoine"  : {
		"type": "FeatureCollection",
		"features": [..]
	},
	"secteur" : {
		"type": "FeatureCollection",
		"features": [..]
	}
}
```

## Missions Secteurs
`GET /missions_secteurs.php?secteurs=<Liste des secteurs>&chef_groupe=<login>&chefs_groupe=<id chef de groupe véhicule>`

**Example**

`GET <BASE_SERVER_URL>/missions_secteurs.php?secteurs='EST'&chef_groupe=charly01&chefs_groupe=C2,C3`

**Request response**
```json
{
  "code": 200,
  "missions": "<geojons de toutes les missions en cours sur le ou les secteurs>",
  "mission_en_cours":"id de la mission en cours s'il y en a une pour le chef de groupe connecté"
}
```

## Selection mission
`GET /selection_mission.php?mission=<id de la mission>`

**Example**

`GET <BASE_SERVER_URL>/selection_mission.php?mission=2190025

**Request response**
```json
{
  "code": 200,
  "mission" : "<geojson de la mission>"
}
```

## Rejoindre mission
`GET /rejoindre.php?mission=<id de la mission>&chef_groupe=<id du chef de groupe = login>&chefs_groupe=<chefs groupe véchicule>`

**Example**

`GET <BASE_SERVER_URL>/rejoindre.php?mission=2190025&chef_groupe='charly01'&chefs_groupe=C2,C3


**Request response**
```json
{
  "code": 200,
}
```

## Position mission
`GET /position.php?mission=<id de la mission>&chef_groupe=<id du chef de groupe = login>&autre_chef_groupe=<chefs de groupe du véhicule>`

**Example**

`GET <BASE_SERVER_URL>/rejoindre.php?mission=2190025&chef_groupe='charly01'&autre_chef_groupe=C2,C3


**Request response**
```json
{
  "code": 200,
}
```


