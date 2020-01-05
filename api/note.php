<?php
error_reporting(-1);
require_once __DIR__ . "/load.php";

function error($code = false){
	die(json_encode([ "error" => $code ]));
}

function success($code = true){
	die(json_encode([ "ok" => $code ]));
}

if(!$logged) error("Nicht angemeldet.");


$root = __DIR__ . "/../notes/" . md5($userID);

$data = (object) $_POST["data"];
$noteID = (int) $data->id;

$path = $root . "/$noteID.note";

if ($_POST["type"] === "saveNote") {

	if(!is_dir($root)) mkdir($root, 0700);
	
	$handle = fopen($path, "w+");
	$write = @fwrite ($handle, $data->data);
	fclose ($handle);

	if(is_file($path)) success("gespeichert");
	else error("Fehler beim speichern");
	
}

else if ($_POST["type"] === "deleteNote") {

	unlink($path);
	
	if(!is_file($path)) success("gelöscht");
	else error("Fehler beim löschen");

}

error("Fehler");