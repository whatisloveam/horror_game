// функция, которая вызывается в момент загрузки страницы
window.onload = function() {
	// создаем новый объект игры, указываем размеры области игры, отрисовщик и
	// ссылки на методы загрузки, создания, обновления
	var game = new Phaser.Game(640,480,Phaser.CANVAS,"",{preload:onPreload, create:onCreate, update:onUpdate});                
	
	// задаем переменные для всех спрайтов(изображений на нашей игре)
	var player;
	var wallsBitmap;
	var floor;
	var screamer;

	//функция предзагрузки всех данных
	function onPreload() {
		// первый аргумент указывает как картинка будет называться в памяти движка, а второй - само имя файла
		game.load.image("floor","floor.png");
		game.load.image("walls","walls.png");
		game.load.image("player","player.png");
		game.load.image("screamer", "Shrek.png");
	}
	//функция, которая делает наше игровое окно максимально большим, расстягивает его во все браузерное окно
	function goFullScreen(){
		//выравниваение нашей игры по центру
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		//задаем режим расстягивания игрового окна
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setScreenSize(true);
	}
	//функция для инициализации всех переменных и задачи всех параметров перед игрой
	function onCreate() {
		//расстягиваем наше игровое окно
		goFullScreen();
		//добавление картинки пола в координату 0, 0
		floor = game.add.sprite(0,0,"floor");
		//создаем пустую картинку на всю область нашей игры
		wallsBitmap = game.make.bitmapData(640,480);
		//на пустой картике рисуем стены нарисуются только черные стены, а прозрачные области останутся таковыми
		wallsBitmap.draw("walls");
		//для изменении картинки в памяти нужно ее обновить
		wallsBitmap.update();
		// теперь можно нарисовать эту картинку
		game.add.sprite(0,0,wallsBitmap);
		//рисуем нашего игрока в координатах 80,80 (картинку игрока можно заменить,
		//но для простоты ее обработки в программе необходимо сделать ее квадратной)
		player = game.add.sprite(80,80,"player");
		//переносим точку координат позиции квадрата из левого верхнего угла в центр квадрата
		//измерять позицию от центра будет проще чем от левого верхнего края
		player.anchor.setTo(0.5,0.5);
		//ставим нашу "страшную" картинку куда-то на карту главное не в стену
		screamer = game.add.sprite(370, 300, "screamer");
		//уменьшаем картинку в 5 раз (1 это оригинальный размер, 0.2 уменьшенный в 5 раз. 
		//Если задать разные аргументы то получится искажение картинки)
		screamer.scale.setTo(0.2, 0.2);
		//записываем в переменную cursors все стрелочки, которые существуют на клавиатуре
		cursors = game.input.keyboard.createCursorKeys();
		//создаем пустую графику (графикой считается любая фигура, нарисованная из линий)
		maskGraphics = this.game.add.graphics(0,0);

		//необходимо понимать, что пол и страшная картинка должны быть видны через фонарик.
		//Для получения этого эффекта у любой картинки есть такое свойство как mask которое
		// указывает через что можно видеть эту картинку. Фонарик у нас нарисован из линий и заливки между ними
		// а вместе все они это maskGraphics
		floor.mask = maskGraphics;
		screamer.mask = maskGraphics;
	}
	//фукция которая обновляется максимально часто
	function onUpdate() {
		//проверка всех стрелочек
		var xSpeed = 0;
		var ySpeed = 0;
		if(cursors.up.isDown){
			ySpeed -=2;
		}
		if(cursors.down.isDown){
			ySpeed +=2;
		}
		if(cursors.left.isDown){
			xSpeed -=2;
		}
		if(cursors.right.isDown){
			xSpeed +=2;
		}

		if(Math.abs(xSpeed)+Math.abs(ySpeed)<10 && Math.abs(xSpeed)+Math.abs(ySpeed)>0){
			//проверка колиззии(столкновения) со стенами
			//проверка заключается в том, чтобы определить цвет пикселей в углах квадрата игрока (нужен цвет не игрока,
			//а картинки игроком)
			//если пиксель в угле не черный(color == 0), то нам можно двигаться 
			//если пиксель черный то мы не должны никуда двигаться
			var color = wallsBitmap.getPixel32(player.x+xSpeed+player.width/2,player.y+ySpeed+player.height/2);
			color+= wallsBitmap.getPixel32(player.x+xSpeed-player.width/2,player.y+ySpeed+player.height/2);
			color+=wallsBitmap.getPixel32(player.x+xSpeed-player.width/2,player.y+ySpeed-player.height/2)
			color+=wallsBitmap.getPixel32(player.x+xSpeed+player.width/2,player.y+ySpeed-player.height/2)
			if(color==0){
				player.x+=xSpeed;
				player.y+=ySpeed;
			}
		}

		var lightAngle = Math.PI/4; // угол в 45 градусов в радианах (1 радиан такой угол который образуется путем натяжения радиуса на дугу)
		var numberOfRays = 20; // количество лучей 
		var rayLength = 100; // длина лучей

		// получаем угол на который смотрит мышка
		var mouseAngle = Math.atan2(player.y-game.input.y,player.x-game.input.x);
		// очистка графики
		maskGraphics.clear();
		// настраиваем ручку которой будем рисовать (задаем толщину и цвет)
		maskGraphics.lineStyle(2, 0xffffff, 1);
		// цвет заливки
		maskGraphics.beginFill(0xffff00);
		//начинаем рисовать с координат игрока
		maskGraphics.moveTo(player.x,player.y);	
		//рисуем все наши лучи
		for(var i = 0; i<numberOfRays; i++){
			//вычисляем угол для луча			
			var rayAngle = mouseAngle-(lightAngle/2)+(lightAngle/numberOfRays)*i
			var lastX = player.x;
			var lastY = player.y;
			//начинаем дорисовывать по пикселю для луча с проверкой попадания на стенку
			for(var j= 1; j<=rayLength;j+=1){
          		var landingX = Math.round(player.x-(2*j)*Math.cos(rayAngle));
				var landingY = Math.round(player.y-(2*j)*Math.sin(rayAngle));
				// если не стена продолжаем рисовать луч
          		if(wallsBitmap.getPixel32(landingX,landingY)==0){
					lastX = landingX;
					lastY = landingY;	
				} // если стена то рисуем этот луч и выходим из цикла
				else{
					maskGraphics.lineTo(lastX,lastY);
					break;
				}
			}
			maskGraphics.lineTo(lastX,lastY);
		}	
		//заканчиваем рисование и прекращаем заливку
		maskGraphics.lineTo(player.x,player.y);
		maskGraphics.endFill();
		//создаем эффект мерцания для пола
		floor.alpha = 0.5 + Math.random() * 0.5;
	}	
}