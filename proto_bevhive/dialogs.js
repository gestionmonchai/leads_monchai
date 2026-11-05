export function bindDialog(dialog,openers,{onOpen}={}){
 let returnTo=null;
 const open=event=>{event?.preventDefault();returnTo=event?.currentTarget||document.activeElement;if(!dialog.open)dialog.showModal();onOpen?.();};
 for(const opener of openers)opener.addEventListener('click',open);
 dialog.querySelector('[data-close-dialog]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
 dialog.addEventListener('close',()=>returnTo?.focus({preventScroll:true}));
 return {open,close:()=>dialog.close()};
}
