<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" type="text/css" href="CMP.css">
  <!-- -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
  <script src="https://code.createjs.com/createjs-2015.11.26.min.js"></script>
  <script src="sprite.js"></script>
  <script src="scene.js"></script>
  <script src="player.js"></script>
  <script src="music.js"></script>
  <script src="mainField.js"></script>
</head>
<body>
  <!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       その1　メインのプレイフィールド
       担当 m
  -->
  <p>
    <h1></h1>
    <canvas id="mainField" width="960" height="540"></canvas>
  </p>

  <!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       その2　各パートパターン選択
       担当 o, k
  -->
  <p>
    <h1>各パートパターン選択</h1>
    <div class = "colk">
        <img src= "bord.jpg" class = "colk">
        <img width = 150px height = 250px style = "position:absolute;top:10px;left:10px;" src= "memo.png">
    
        <form action="CMP.php" medhot="get">
    
        <p style = "position:absolute;top:0px;left:30px;">楽器A</p>
        <p style = "position:absolute;top:25px;left:10px;"><input type ="radio" name ="playerA" value = "you">自分</p>
        <p style = "position:absolute;top:50px;left:10px;"><input type ="radio" name ="playerA" value = "playerA">他の人</p>
    
        <img width = 150px height = 250px style = "position:absolute;top:10px;left:170px;" src= "memo.png">
        <p style = "position:absolute;top:0px;left:190px;">楽器B</p>
        <p style = "position:absolute;top:25px;left:170px;"><input type ="radio" name ="playerB" value = "you">自分</p>
        <p style = "position:absolute;top:50px;left:170px;"><input type ="radio" name ="playerB" value = "playerB">他の人</p>
    
        <img width = 150px height = 250px style = "position:absolute;top:10px;left:330px;" src= "memo.png">
        <p style = "position:absolute;top:0px;left:350px;">楽器C</p>
        <p style = "position:absolute;top:25px;left:330px;"><input type ="radio" name ="playerC" value = "you">自分</p>
        <p style = "position:absolute;top:50px;left:330px;"><input type ="radio" name ="playerC" value = "playerC">他の人</p>
    
        <img width = 150px height = 250px style = "position:absolute;top:10px;left:490px;" src= "memo.png">
        <p style = "position:absolute;top:0px;left:510px;">楽器D</p>
        <p style = "position:absolute;top:25px;left:490px;"><input type ="radio" name ="playerD" value = "you">自分</p>
        <p style = "position:absolute;top:50px;left:490px;"><input type ="radio" name ="playerD" value = "playerD">他の人</p>
    
        
        <input type = "submit" class = "button" value = "play" >
    </div>
    
    <?php 
          if(isset($_GET["playerA"]) && isset($_GET["playerB"]) && isset($_GET["playerC"]) && isset($_GET["playerD"])){
            $playerA = $_GET["playerA"];
            $playerB = $_GET["playerB"];
            $playerC = $_GET["playerC"];
            $playerD = $_GET["playerD"];
            $count =0;
            if($playerA == "you")$count++;
            if($playerB == "you")$count++;
            if($playerC == "you")$count++;
            if($playerD == "you")$count++;
    
            if($count == 1){
              header("Location: test.php");
              exit;
            }
          }
          
        ?>
  </p>

  <!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       その3　セッション選択
       担当 o, k
  -->
  <p>
    <h1>セッション選択</h1>
  </p>


  <!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       ´・_・`    セサミサンドイッチくん
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
  <p>
    bpmを入力するには一度楽曲を停止してください<br>
    <button id="playButton" onclick="playAndPauseSound()">楽曲を再生する</button>
    <button onclick="stopSound()">楽曲を停止する</button><br>
    <form name="js">
      bpm<input type="text" name="bpmBox" value="165.17">
    </form>
    <span id="bgmBoxEx"></span><br>
    Instanse:<span id="bgmInstance">***</span><br>
    Name:<span id="bgmName">***</span><br>
    Paused:<span id="bgmPaused">***</span><br>
    Pos:<span id="bgmPos">***</span><br>
    Played:<span id="bgmPlayed">***</span><br>
    Term:<span id="bgmTerm">***</span><br>
    Beat:<span id="bgmBeat">***</span><br>
    <button onclick="ticktack([4])">clap</button><br>
    楽曲素材: <a href="http://www.manbou2ndclass.net/">まんぼう特攻隊</a><br>
    効果音素材: <a href="http://osabisi.sakura.ne.jp/m2/">ザ・マッチメイカァズ</a>
  </p>
</body>
</html>