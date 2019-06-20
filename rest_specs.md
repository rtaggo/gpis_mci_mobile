# GPIS MCI Mobile App REST Specs

## Login
URL     :<BASE>/connexion.php
Methodes: POST 
Request body: { login: 'john', password: 'doe'}
Request response:
{
    authentification : true | false
    role: 'india' | 'charly' | 'alpha',
    token: <TOKEN> pour plus tard utiliser les headers des requetes 
}


## Patrouilles
URL     :<BASE>/patrouilles.php
Methodes: GET
Request response:
{
    "patrouilles": [
        {"name": "GOLF 03", "id": 3 },
        {"name": "GOLF 11", "id": 11},
        {"name": "GOLF 14", "id": 14 }
    ]
}

## Sous-secteurs
URL     :<BASE>/sous_secteurs.php?patrouille=<ID_patrouille>
Methodes: GET
Request response:
{
    "sous-secteurs"  : []  // cf power point la reponse
}

## secteurs
URL     :<BASE>/secteurs.php
Methodes: GET
Request response:
{
    "secteurs"  : []  // cf power point la reponse
}


## Patrimoine Sous secteur
/patrimoine_sous_secteur.php?patrouille=<idpatrouille>&sssecteurs=3,11,14
Methodes: GET
Request response:
{

}

## Patrimoine Sous secteur
/misson_sous_secteur.php?patrouille=<idpatrouille>
Methodes: GET
Request response:
{
 code: 200 | 300 (200: ok, 300:ko)
 message: <message erreur si 300>
 mission: <geojons de la mission>
}


## MaJ Mission
/maj_mission.php
Methodes: POST
Request body : 
{
    mission_id: <ID Mission>,
    code : 1 | 3 | 5
}
Request response:
{
 code: 200 | 300 (200: ok, 300:ko)
 message: <message erreur si 300>
}



## signalement.php
GET 
    => 
    {
        types_signalement: [list des types de signalement],
        types_lieux [list des types de lieu],

    }


## Reaffectation
GET /reaffectation.php?signalement=<id signalement>
 => ensemble des infos


/reaffectation.php
POST
Request body 
{
    signalement : <id signalement>,
    mission: <id misson>
    photo: String png base64 si modif
}

Request response:
{
 code: 200 | 300 (200: ok, 300:ko)
 message: <message erreur si 300>
}

## Voisinage
/voisinage.php?patrouille=<idpatrouille>&sssecteurs=3,11,14
Methodes: GET
Request response:
{

}
