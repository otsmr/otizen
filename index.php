<?php
require_once __DIR__ . "/api/load.php";

if(!$logged)  header("Location: $loginURL");

$root = __DIR__ . "/notes/" . md5($userID);

$files = scandir($root);
$notes = [];

foreach ($files as $key => $value) {
	if($value === "." || $value === "..") continue;
    array_push($notes, [
		"id" => str_replace(".note", "", $value),
		"data" => file_get_contents($root . "/" . $value),
	]);
}

?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Otizen - verschlüsselte Notizen</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
	<link rel="stylesheet" href="/assets/fonts/fontawesome/css/all.min.css">
	<link rel="shortcut icon" href="/assets/img/logo-round.png" type="image/png">

	<script>
		const noteData = <?php echo json_encode($notes) ?>;
	</script>
	<link rel='stylesheet' href='/assets/css/main.min.css?v=1.0.0'>
</head>

<body>
	
	<div class="menu">
		<div class="toggle" onclick="$(this).parent().children().toggleClass('open')">
			<i class="fas fa-layer-group"></i> Menü
		</div>
		<div class="list">
			<ul>
				<a onclick="notes.newPass()"><li>Passwort ändern</li></a>
				<a href="<?php echo $logoutUrl; ?>"><li>Abmelden</li></a>
			</ul>
		</div>
		
	</div>
	
	<main></main>

	<script src='/assets/js/lib.min.js?v=1.0.0'></script>
	<script src='/assets/js/main.min.js?v=1.0.0'></script>
	
</body>
</html>