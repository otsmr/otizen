class LocalStorageHelper {
    set(key, val){
        val = JSON.stringify(val);
        if(!val) return;
        try {
            localStorage.setItem(key, val);
        } catch (error) {
            console.log(error);
        }
        if(key.startsWith("treeFile_ConnID")){
            this.uploadToDataBase();
        }
    }
    get(key){
        var result = localStorage.getItem(key);
        if(!result) return false;
        return JSON.parse(result);
    }

}
class Helper{
	compareValues (key, order='asc') {
        return function(a, b) {
            if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;
            const varA = (typeof a[key] === 'string') ?  a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string') ?  b[key].toUpperCase() : b[key];
            let comparison = 0;
            if (varA > varB) comparison = 1;
            else if (varA < varB) comparison = -1;
            return ((order == 'desc') ? (comparison * -1) : comparison);
        };
    }
	
	getImageText(text){
        var canvas = document.createElementNS("http://www.w3.org/1999/xhtml","canvas");
        var ctx = canvas.getContext("2d");
        ctx.font = "12px Roboto";
        canvas.width = ctx.measureText(text).width + 10;
        canvas.height = 16;
        ctx.fillStyle = "#f7a600";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "12px Roboto";
        ctx.fillStyle = "#000";
        ctx.fillText(text,5,12); 
        return canvas;
    }
	
	setTAAuto(){
		for (const area of $("textarea")) {
			if(!$(area).hasClass("new"))
             this.setTextAreaHeight(area);
        }
	}
	
	setTextAreaHeight(tarea){
		tarea.style.height = "1px";
  		tarea.style.height = (3+tarea.scrollHeight)+"px";
		$(".notes").masonry("layout");
	}
	
	getRandomNumber() {
        var pow = Math.pow(5, 8);
        return Math.floor(Math.random() * (9 * pow)) + pow;
    }
	
}

class ParseRequest{

    parse(r, call, failCall){

        try {
            r = JSON.parse(r);

            if(typeof r.error !== "undefined" && typeof r.ok === "undefined") {
                if(failCall) failCall(r.error);
                else{
                    switch (r.error) {
                        default:
                            // notification.newNoti({text: l.t("connection.failed", this.name, r.error), icon: "warn", quelle: "connections.js"});
                        break;
                    }
                }
            } 
            else {
                if(r.ok === "true") r.ok = true;
                if(r.ok === "false") r.ok = false;
                if(call) call(r.ok);
                else return r.ok;
            } 
        
        } catch (e) {
            console.log(e);
            // notification.newNoti({text: "Bei der Anfrage ist ein unerwarteter Fehler Aufgetreten.", icon: "warn", quelle: "connections.js"});
        }

        return false;
    }
}

var ls = new LocalStorageHelper();
var helper = new Helper();


class Note{
	
	constructor(note){
		this.id = note.id;
		this.pos = note.pos;
		this.text = note.text;
		this.title = note.title;
		this.img = note.img;
		
		this.r = new ParseRequest();
		
		this.api = "api/note.php";
		this.build();
		this.save();
		
	}
	
	build(){
		
		var $title = "";
		if(this.title){
			
			this.$title = $(`<textarea oninput="helper.setTextAreaHeight(this)" rows="1">${this.title}</textarea></header>`);
			$title = $("<header>").append(
				this.$title
			);
		}
		var $img = "";
		if(this.img){
			$img = $(`<div class='img'><img src='${this.img}'></div>`);
			this.$img = $img;
		}
		
		this.$node = $(`<div class='note' noteid='${this.id}' notepos='${this.pos}'>`).append(
			$(`<div class='content'>`).append(
				this.$text = $(`<textarea oninput="helper.setTextAreaHeight(this)" rows="1">${this.text}</textarea>`)	
			),
			$(`<div class='actionbar'>`).append(
				$(`<div class='icon'>`).append(
					this.$delete = $(`<i class="far fa-trash-alt"></i>`),
					this.$drag = $(`<i draggable="true" class="fas fa-arrows-alt"></i>`)
				)
			)
		).prepend($img, $title);
		
	}
	
	setListener(){
		this.$node.off("click").off("dragover").off("dragend").off("drop");
		this.$node.on("dragover", (e)=>{
			e.preventDefault();
			var dt = e.originalEvent.dataTransfer;
			var noteID = dt.getData("noteID");
			if(noteID == "" || noteID == this.id) return;
			
			var note = notes.getNote(noteID);
			var posDrag = note.$node.index();
			var posDrop = this.$node.index();
			
			$('.notes').masonry('destroy');
		
			note.$node.remove();
			
			if(posDrop > posDrag) this.$node.after(note.$node);
			else this.$node.before(note.$node);
			
			notes.setMasonry();
			
			notes.updatePos();
			note.setListener();
			
		}).on("dragend", ()=>{
			
			this.$node.removeClass("aktiv");
			
		}).on("drop", ()=>{
			
			this.$node.removeClass("aktiv");
			
		});
		
		this.$drag.off("dragstart").on("dragstart", (e)=>{
			var dt = e.originalEvent.dataTransfer;
			dt.setData("noteID", this.id);
			dt.setDragImage(helper.getImageText(this.title), -13, -13);
			this.$node.addClass("aktiv");
			
		});
		
		this.$text.blur(()=>{
			if(this.text !== this.$text.val()){
				this.save();
			}
		});
		if(this.$title) this.$title.blur(()=>{
			if(this.title !== this.$title.val()){
				this.save();
			}
		});
		
		if(this.$img) this.$img.click(()=>{
			this.$img.toggleClass("open");
		})
		
		this.$delete.off("click").click(()=>{
			if(this.$node.hasClass("delet")){
				this.delete();
			}
			this.$node.addClass("delet");
		}).off("mouseleave").mouseleave(()=>{
			this.$node.removeClass("delet");
		})
	}
	
	
	delete(){
		$.post(this.api, {type: "deleteNote", data: {
			id: this.id
		}}).done((r)=>{
			this.r.parse(r, (r)=>{
				this.$node.remove();
				notes.setPos();
			}, (r)=>{
				notes.alert(r);
			});
		});
	}
	
	save(){
		
		var data = this.get();
		var enc = c.en(JSON.stringify(data));
		
		$.post(this.api, {type: "saveNote", data: {
			id: data.id,
			data: enc
		}}).done((r)=>{
			this.r.parse(r, (r)=>{

			}, (r)=>{
				notes.alert(r);
			});
		});
		
	}
	
	get(){
		var title = "";
		if(this.$title) title = this.$title.val();
		return {
			pos: this.pos,
			text: this.$text.val(),
			img: this.img,
			id: this.id,
			title: title
		};
	}
	
}


class NoteManager{
	
	constructor(){
		
		this.notes = [];
		this.items = [];
		this.n = [];
		this.imgUrl = "";
		
		this.pass = "";
		
		this.$notes = $("<div class='notes'><div class='grid-sizer'></div></div>").appendTo("main");
		
		this.setPassModal();
		
	}
	
	alert(text){
		$(".alert").remove();
		$(`<div class="alert" onclick="$(this).remove()">
			<p>${text}</p>
			<div class="close" onclick="$(this).parent().remove()">
				<i class="far fa-times-circle"></i>
			</div>
		</div>`).appendTo("body");
	}
	
	setPassModal(){
		
		var desc = "";
		var mClass = "";
		var btn = "Notizen entschlüsseln";
		if(noteData.length === 0){
			desc = "Für die Verschlüsselung der Notizen<br> ist ein Passwort erforderlich.";
			mClass = "desc";
			btn = "Passwort festlegen"
		}
		
		this.$passModal = $(`<div class="pass ${mClass}">`).append(
			$(`<p class='desc'>${desc}</p>`),
			this.$pass = $(`<input type="password" id="pass" placeholder="Passwort eingeben">`).keyup((e)=>{
				if(e.keyCode === 13){
					this.startUp();
				}
			}),
			$(`<button>${btn}</button>`).click(()=>{
				this.startUp();
			})
		).appendTo("body");
		
		this.$pass.focus();
					
	}
	
	encryptData(){
		
		for (const note of noteData) {
			
			var dec = c.de(note.data);
			
			if(dec !== ""){
				var enc = JSON.parse(dec);
				this.n.push({
					id: note.id,
					pos: enc.pos,
					title: enc.title || "",
					text: enc.text,
					img: enc.img || "",
				 });
			}else{
				this.alert("Falsches Passwort.");
				this.$passModal.fadeIn(0);
			}

        }
		
		var int = setInterval(() => {
			if(this.n.length === noteData.length){
				clearInterval(int);
				this.loadNotes();
			}
        }, 100);
		
	}
	
	startUp(pass = false){
		
		if(pass){
			pass = pass;
		}else{
			pass = generatePass(this.$pass.val());
		}
		
		c.setKey(pass);
		
		if(noteData === "" || noteData.length === 0) {
			this.loadNotes();
			return;
		}
		
		var dec = c.de(noteData[0].data);
		if(dec === ""){
			this.$pass.val("").focus();
			this.alert("Falsches Passwort.");
			this.$passModal.fadeIn(0);
		}else{
			this.encryptData();
		}
		
	}
	
	loadNotes(){

		this.$passModal.fadeOut(0);
		
		this.build();
		
		this.setPos();
		this.newnote();
	}
	
	uploadImage(){
		
		if(this.imgUrl !== "") {
			this.imgUrl = "";
			this.$img.attr("src", "");
			return;
		} 
		
		$("<input type='file'>").on('change', (e)=>{
			var files = e.target.files[0];
			
			var a = new FileReader();
			a.onload = ((c) =>  {
			    return (f) => {
			      var d = c.name.split('.').pop();
			      if (/^jpg|png|gif|jpeg$/i.test(d)) {
					  this.imgUrl = f.target.result;
					  this.$img.attr("src", f.target.result)
			      }
			    }
			})(files);
			a.readAsDataURL(files)
			
		})[0].click();
		
	}
	
	newnote(){
		
		$("body").append(
			this.$newnote = $("<div class='newnote'>").append(
				$("<div class='img'>").append(
					this.$img = $("<img>")
				),
				this.$title = $("<input type='text' placeholder='Titel eingeben'>"),
				this.$text = $(`<textarea class="new text" type="text" placeholder="Notieren..."></textarea>`),
				$("<div class='iconbar'>").append(
					$("<ul>").append(
						$("<li class='left' title='Abbrechen'>").append(`<i class="far fa-times-circle"></i>`).click(()=>{
							this.cancel()
						}),
						$("<li title='Bild hinzufügen'>").append(`<i class="far fa-image"></i>`).click(()=>{
							this.uploadImage()
						}),
						$("<li title='Notiz erstellen'>").append(`Erstellen`).click(()=>{
							this.creatNew()
						})
					)
				)
			)
		);

		this.$text.focusin(()=>{
			this.$newnote.addClass("focus");
		});
		
	}
	
	cancel(){
		this.$title.val("");
		this.$text.val("");
		this.imgUrl = "";
		this.$img.attr("src", "");
		this.$newnote.removeClass("focus");
	}
	
	creatNew(){
		var img = "";
		if(this.imgUrl){
			img = this.imgUrl;
		}
		
		this.build([{
			"title": this.$title.val(),
			"text": this.$text.val(),
			"pos": 0,
			"img": img,
			"id": helper.getRandomNumber()
		}]);
		this.cancel();
	}
	
	getNote(v){
        for(var i in this.notes) if(this.notes[i]["id"] == v) return this.notes[i];
        return false;
	}
		
	build(n = false){
		
		if(!n) n = this.n;
		
		for (const note of n) {
			var item = new Note(note);
			this.notes.push(item);
            this.$notes.append(item.$node);
        }
		
		// this.updatePos();
		this.setPos()
		
	}
	
	updatePos(){
		
		for (const item of this.notes) {
			var newPos = item.$node.index(".note") + 1;
			if(newPos !== item.pos){
            	item.pos = newPos;
				item.save();
				item.$node.attr("notepos", item.pos);
			}
        }
		
		$('.notes').masonry('layout');
		helper.setTAAuto();
		
	}
	
	setMasonry(){
		$('.notes').masonry({ 
			itemSelector: '.note'
		});	
	}
	
	
	setPos(){
		
		$('.notes').masonry('destroy');
		
		var items = [];
		var $notes = this.$notes.children(".note");
		
		for (const $note of $notes) {
			items.push({
				pos: this.getNote($($note).attr("noteid")).pos,
				node: $($note)
			});
        }
		
		items = items.sort(helper.compareValues("pos", "desc"));

		this.$notes.empty();
		
		for (const note of items) {
             if(note.pos === 0)
				 this.$notes.append(note.node);
			 else this.$notes.prepend(note.node);
        }
		
		for (const item of this.notes) {
            item.setListener();
        }
		
		helper.setTAAuto();
		this.setMasonry();
		
	}
	
	
	newPass(){
		this.$notes.fadeOut(0);
		if(this.$newnote) this.$newnote.fadeOut(0);
		if(this.$newPassModal) this.$newPassModal.remove();
		
		this.$newPassModal = $(`<div class="pass">`).append(
			this.$newPass = $(`<input id="pass" placeholder="neues Passwort eingeben">`).keyup((e)=>{
				if(e.keyCode === 13){
					this.saveNewPass();
				}
			}),
			$(`<button>Passwort ändern</button>`).click(()=>{
				this.saveNewPass();
			}),
			$(`<button class='left'>Abrechen</button>`).click(()=>{
				this.$newPassModal.remove();
				this.$notes.fadeIn();
				if(this.$newnote) this.$newnote.fadeIn();
			})
		).appendTo("body");

	}
	
	saveNewPass(){
		
		var pass = generatePass(this.$newPass.val());
		
		
		this.$newPassModal.remove();
		this.$notes.fadeIn();
		this.$newnote.fadeIn();
		c.setKey(pass);
		
		var $notes = this.$notes.children(".note");
		
		for (const $note of $notes) {
			this.getNote($($note).attr("noteid")).save();
        }
		
	}
	
}


function generatePass(pass){
	// return pass;
	
	var sha = sha256(pass);
	var splitet = sha256(pass).split("a");
	splitet.reverse();
	
	var last = sha.slice(sha.length / 2);
	
	var res = last + splitet[0] + splitet + splitet[splitet.length - 1] + sha;
	
	return res.replace(/,/g, "");
	
}


var notes, c;
$(()=>{
		
	class Crypt{
		
		setKey(key){
			this.key = key;
		}
		
		en(text){
			return CryptoJS.AES.encrypt(text, this.key).toString();
		}
		
		de(text){
			var de = CryptoJS.AES.decrypt(text, this.key);
			return de.toString(CryptoJS.enc.Utf8);
		}
		
	}
	
	c = new Crypt();
	notes = new NoteManager();
	
})