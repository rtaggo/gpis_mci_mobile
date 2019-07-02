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
  "token": "<TOKEN> pour plus tard utiliser les headers des requetes" 
}
```

**Example**
```json
{
  "authentification" : true,
  "role": "india"
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

## Voisinage
`GET /voisinage.php?patrouille=<idpatrouille>&sssecteurs=<Liste des secteurs>`

**Example**

`GET <BASE_SERVER_URL>/voisinage.php?patrouille=<idpatrouille>&sssecteurs=3,11,14`

**Request response**
```json
{
  "code": 200,
  "sous-secteur": "<geojson du ou des sous-secteurs>",
  "mission_ronde": "<geojons des derniers positionnements des patrouilles>"
}
```

## Missions Secteurs
`GET /missions_secteurs.php?secteurs=<Liste des secteurs>`

**Example**

`GET <BASE_SERVER_URL>/missions_secteurs.php?secteurs='EST'`

**Request response**
```json
{
  "code": 200,
  "secteur" : "<geojson du ou des secteurs>",
  "patrimoine" : "<geojson du patrimoine>",
  "mission_ronde": "<geojons de toutes les missions en cours sur le ou les secteurs>"
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
`GET /rejoindre.php?mission=<id de la mission>&chef_groupe=<id du chef de groupe = login>`

**Example**

`GET <BASE_SERVER_URL>/rejoindre.php?mission=2190025&chef_groupe=CHARLY01


**Request response**
```json
{
  "code": 200,
}
```