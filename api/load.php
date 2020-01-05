<?php
$logged = false;

ini_set('session.cookie_domain', '.' . $_SERVER["SERVER_NAME"] );
session_name('sid');
session_start();


require_once __DIR__ . "/../config.php";

$loginURL =  $CONFIG["odmin_base_url"] . "/login?service=" . $CONFIG["odmin_service_name"];
$logoutUrl = $CONFIG["odmin_base_url"] . "/api/logout/" . $_COOKIE["token"] . "?service=" . $CONFIG["odmin_service_name"];


if(isset($_COOKIE['token'])){

    $url = $CONFIG["odmin_base_url"] . "/api/istokenvalid/" . $_COOKIE['token'];

    try {

        $res = json_decode(file_get_contents($url));
        if(isset($res->valid) && $res->valid) {

            $logged = true;
            $userID = $res->user->id;
        }
        
    } catch (\Throwable $th) { }

}