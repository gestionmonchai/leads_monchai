(function(root){
  'use strict';
  const questions=[
    {title:'Un « œil » sur un sarment, c’est…',options:['Un bourgeon','Une petite grappe','Une marque de taille'],correct:0,explanation:'L’œil est un bourgeon. Le nombre d’yeux conservés fait partie des choix de taille.'},
    {title:'Pour choisir quand vendanger, on croise surtout…',options:['La couleur du tracteur et le calendrier','Les analyses, la dégustation et la météo','La taille des bouteilles'],correct:1,explanation:'On rapproche les observations et les analyses de l’objectif de vin recherché et des conditions du moment.'},
    {title:'Pendant la fermentation alcoolique, les levures transforment…',options:['L’eau en sucre','Le bois en tanins','Les sucres en alcool'],correct:2,explanation:'Les levures transforment les sucres du raisin en alcool, avec notamment un dégagement de CO₂.'},
    {title:'L’ouillage d’un fût sert à…',options:['Compléter le niveau avec du vin','Réchauffer le vin','Changer la couleur du vin'],correct:0,explanation:'Dans un élevage classique sans voile, on compense le manque pour limiter l’espace d’air au-dessus du vin.'},
    {title:'Mon Chai accompagne le vigneron…',options:['Uniquement pour choisir ses étiquettes','De la vigne à la vente','Uniquement pour réserver un stand'],correct:1,explanation:'Mon Chai rassemble la gestion du domaine, de la vigne au chai et à la commercialisation.'}
  ];
  function create(){return {participations:1,current:0,answers:Array(questions.length).fill(null)};}
  function answer(state,choice){
    if(!Number.isInteger(choice)||choice<0||choice>=questions[state.current].options.length||state.answers[state.current]!==null)return state;
    const answers=[...state.answers];answers[state.current]=choice;return {...state,answers};
  }
  function next(state){return state.answers[state.current]===null||state.current===questions.length-1?state:{...state,current:state.current+1};}
  function summary(state){return {participations:state.participations,score:state.answers.reduce((n,a,i)=>n+(a!==null&&a===questions[i].correct?1:0),0),answered:state.answers.filter(a=>a!==null).length,total:questions.length};}
  function replay(state){return {...create(),participations:state.participations};}
  const api={questions,create,answer,next,summary,replay};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuizMonChai=api;
})(globalThis);
