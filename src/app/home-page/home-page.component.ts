import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor() {}

  ngOnInit() {}

  about(){
    var a = document.getElementById("about");
    var l = document.getElementById("logo");
    if (a.style.display === "block"){
      a.style.display = "none";
      l.style.display = "block";
    } else {
      l.style.display = "none";
      a.style.display = "block";
    }
  }

}
