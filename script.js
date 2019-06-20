(function(){
    var cnv = document.querySelector("canvas");
    var ctx = cnv.getContext("2d");

    var WIDTH = cnv.width, HEIGHT = cnv.height; // tamanho total do labirinto

    var LEFT = 37, UP = 38, RIGHT = 39 , DOWN = 40; // valores das teclas
    var mvLeft = mvUp = mvRight = mvDown = false;

    var tilesize = 64; // tamanho de cada quadrado na matriz
    var tilesizeimg = 96; // dimensoes de capture das sprittes

    var estruturas = new Image(); // objeto para armazenar a imagem das estruturas
        estruturas.src = "imgs/estruturas.png";
        estruturas.addEventListener("load",function(){ //add um evento para executar a loop quando a imagem terminar de carregar (boapratica)
            requestAnimationFrame(loop,cnv);
        },false);

    var personagem = new Image(); // objeto para armazenar a imagem do personagem
        personagem.src = "imgs/player.png";
        personagem.addEventListener("load",function(){ //add um evento para executar a loop quando a imagem terminar de carregar (boapratica)
            requestAnimationFrame(loop,cnv);
        },false);
    
    var imgGG = new Image();
        imgGG.src = "imgs/gg.png";
        imgGG.addEventListener("load",function(){ //add um evento para executar a loop quando a imagem terminar de carregar (boapratica)
            requestAnimationFrame(loop,cnv);
        },false);


    var walls = [];

    var player = { // valores de tamanho e movimentaçao do player
        x: tilesize + 2,
        y: tilesize + 2,
        w: 24,
        h: 32,
        speed: 2,
        srcX: 0, // buscar as sprittes
        srcY: tilesizeimg, 
        cont: 0 // contador pra zerar as sprittes
    };

    var maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
		[1,1,1,0,1,1,1,0,0,1,0,0,0,1,0,0,0,0,0,1],
		[1,0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,1,1,1,1],
		[1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0,1],
		[1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,1],
		[1,0,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
		[1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
		[1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1]
    ];

    var T_WIDTH = maze[0].length * tilesize, //constantes com valores do tamanho do maze
        T_HEIGHT = maze.length * tilesize;

     for(var i in maze){ // repitaçao para preencher o array de walls
            for(var j in maze[i]){
                var tile = maze[i][j];
                if (tile === 1){
                   var wall = {
                        x: tilesize*j,
                        y: tilesize*i,
                        w: tilesize,
                        h: tilesize
                   };
                   walls.push(wall);
                }
            }
        }

        cam = { // objeto camera
            x: 0,
            y: 0,
            w: WIDTH,
            h: HEIGHT,
            innerLeft: function(){ // para movimentar num quadrado dentro do canvas de 50 porcento 
                return this.x + (this.w*0.25);
            },

            innerTop: function(){
                return this.y + (this.h*0.25);
            },

            innerRight: function(){
                return this.x + (this.w*0.75);
            },

            innerDown: function(){
                return this.y + (this.h*0.75);
            }

        };
    

    function blockrec(objA,objB){    // funcao para colisao obja = player objb = walls
        var distX = (objA.x + objA.w/2) - (objB.x + objB.w/2); // para pegar o valor central do bloco no eixo x
        var distY = (objA.y + objA.h/2) - (objB.y + objB.h/2); //  e no eixo y
        
        var somaW = (objA.w + objB.w)/2;
        var somaH = (objA.h+ objB.h)/2;

        if(Math.abs(distX) < somaW && Math.abs(distY) < somaH){ // verificar se tem colisao no x ou no y
            var overX = somaW - Math.abs(distX);
            var overY = somaH - Math.abs(distY);

            if(overX > overY){
                objA.y = distY > 0 ? objA.y + overY : objA.y - overY; // condiçoes para verificar onde ocorre a colisao no eixo X ou Y
            }else {
                objA.x = distX > 0 ? objA.x + overX : objA.x - overX;
            }
        }
    }

    window.addEventListener("keydown",keydown,false); // evento para quando clickar na tecla
    window.addEventListener("keyup",keyup,false); // evemt para quando soltar a tecla

    function keydown(e){ // funcao para quando clickar movimentar
        var key = e.keyCode;
        switch(key){
            case LEFT:
                mvLeft = true;
                break;
            case UP:
                mvUp = true;
                break;
            case RIGHT:
                mvRight = true;
                break;
            case DOWN:
                mvDown = true;
                break;
        }
    }

    function keyup(e){ // funcao para quando soltar a tecla parar de se movimentar
        var key = e.keyCode;
        switch(key){
            case LEFT:
                mvLeft = false;
                break;
            case UP:
                mvUp = false;
                break;
            case RIGHT:
                mvRight = false;
                break;
            case DOWN:
                mvDown = false;
                break;
        }
    }

    function update(){
        if(mvLeft && !mvRight){ // condiçoes para movimentar o player esquerda direita
            player.x -= player.speed;
            player.srcY = tilesizeimg + player.h * 2;// pra mexer o personagem
        } else if(mvRight && !mvLeft){
            player.x += player.speed;
            player.srcY = tilesizeimg + player.h * 3;
        }
        if(mvUp && !mvDown){ // condiçoes para movimentar o player para cima e baixo
            player.y -= player.speed;
            player.srcY = tilesizeimg + player.h * 1;
        } else if(mvDown && !mvUp){
            player.y += player.speed;
            player.srcY = tilesizeimg + player.h * 0;
        }

        if (mvLeft|| mvDown|| mvRight || mvUp){ // contador pra fazer as animaçoes de mexer os braços e pernas
            player.cont++;
            if(player.cont >= 40){
                player.cont = 0;
            }  
            player.srcX = Math.floor(player.cont/5) * player.w; // frequencia pra mudar a imagem
        }else{ // para o personagem nao ficar no meio do movimento
            player.srcX = 0;
            player.cont = 0;
        }

        for(var i in walls){ // funcao para varrer todos os blocos e executar a funcao de colisao
            var wall = walls[i];
            blockrec(player,wall);
        }




        if(player.x < cam.innerLeft()){ // padroes da camera - para movimentar ela sempre no quadrado de 50%
            cam.x = player.x - (cam.w * 0.25);
        }
        if(player.y < cam.innerTop()){
            cam.y = player.y - (cam.h * 0.25);
        }
        if(player.x + player.w > cam.innerRight()){
            cam.x = player.x + player.w - (cam.w * 0.75);
        }
        if(player.y + player.h > cam.innerDown()){
            cam.y = player.y + player.h - (cam.h * 0.75);
        }

        cam.x = Math.max(0,Math.min(T_WIDTH - cam.w,cam.x));
        cam.y = Math.max(0,Math.min(T_HEIGHT - cam.h,cam.y));
    } 

    function render(){

        ctx.clearRect(0,0,WIDTH,HEIGHT); // retirar o rastro deixado na movimentaçao
        ctx.save(); // salvar o padrao antes de modificaçoes 
        ctx.translate(-cam.x,-cam.y); // para tirar os excessos laterais e manter apenas o tamanho do canvas
        for(var i in maze){
            for(var j in maze[i]){
                var tile = maze[i][j];
                
                var x = j*tilesize;
                var y = i*tilesize;
                ctx.drawImage(//server pra fazer desenhos na tela de imagens prontas
                    estruturas,
                    tile * tilesizeimg, 0, tilesizeimg, tilesizeimg,
                    x,y,tilesize,tilesize
                );
                
            }
        }
        
        ctx.drawImage(
            personagem,
            player.srcX, player.srcY, player.w, player.h,
            player.x, player.y, player.w, player.h
        );
        ctx.restore(); // restaurar para manter os styles do player diferente do maze todo
        if(player.x >= (18 * tilesize) && player.y >= (19*tilesize) ){ // condiçao pra caso ele atinja o final do jogo
            ctx.drawImage(
                imgGG,
                0, 0 , 640, 640,
                0, 0 , 640, 640
            )   
        }
        
    }


    function loop(){
        update();
        render();
        requestAnimationFrame(loop,cnv);

    }
   

}())