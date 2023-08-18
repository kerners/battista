"use strict"

/****** Chat DB ******/

const botDB = {
  answers: [
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters",
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.",
      "All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
  ]
}

const newChatBtn = document.querySelector('#newChatBtn'),
      chatFormMessage = document.querySelector('#chatFormMessage'),
      chatFormMessageInput = document.querySelector('.chatbot-form__input'),
      chatFormMessageBtn = document.querySelector('.chatbot-form__btn'),
      chatMessages = document.querySelector('#chatMessages'),
      chatMain = document.querySelector('.chatbot-main'),
      chatHistoryItem = document.querySelectorAll('.chatbot-history__link'),
      chatHistoryInput = document.querySelectorAll('.chatbot-history__input'),
      chatHistoryItemEdit = document.querySelectorAll('.chatbot-history__btn_edit'),
      chatHistoryItemDelete = document.querySelectorAll('.chatbot-history__btn_delete'),
      chatHistoryItemConfirm = document.querySelectorAll('.chatbot-history__btn_confirm'),
      chatHistoryItemCancel = document.querySelectorAll('.chatbot-history__btn_cancel'),
      speedTypeWrite = 10;

/****** Chat History Item Active Class *****/
chatHistoryItem.forEach(element => element.addEventListener("click", () => {
  chatHistoryItem.forEach(delActive => delActive.classList.remove('active'));
  element.classList.add('active');
}));

/****** Chat History Edit Mode *****/
chatHistoryItemEdit.forEach(element => element.addEventListener("click", (e) => {
  e.stopPropagation();
  let inputHistory = element.parentElement.parentElement.querySelector('.chatbot-history__input');
  let cursorEnd = inputHistory.value.length;
  inputHistory.setSelectionRange(cursorEnd, cursorEnd)
  inputHistory.focus();
  element.parentElement.parentElement.classList.add('edit');
  element.parentElement.parentElement.classList.add('confirm');
}));

/****** Chat History Confirm Button *****/
chatHistoryItemConfirm.forEach(element => element.addEventListener("click", (e) => {
  e.stopPropagation();
  element.parentElement.parentElement.classList.remove('edit');
  element.parentElement.parentElement.classList.remove('confirm');
}));

/****** Chat History Cancel Button *****/
chatHistoryItemCancel.forEach(element => element.addEventListener("click", (e) => {
  e.stopPropagation();
  element.parentElement.parentElement.classList.remove('edit');
  element.parentElement.parentElement.classList.remove('confirm');
}));
      
/****** Chat History Delete Button *****/
chatHistoryItemDelete.forEach(element => element.addEventListener("click", (e) => {
  e.stopPropagation();
  element.parentElement.parentElement.classList.add('confirm');
}));

/****** New Chat Button *****/
newChatBtn.addEventListener("click", () => {
  chatMessages.innerHTML = "";
  chatFormMessageInput.value = "";
  chatFormMessageInput.focus();
});

/****** Chat Button Active ******/
chatFormMessageInput.addEventListener("keyup", () => {
  if(chatFormMessageInput.value.length > 0) {
    chatFormMessageBtn.classList.add('active');
  } else { 
    chatFormMessageBtn.classList.remove('active');
  };
});

/****** Send Message ******/
chatFormMessageInput.addEventListener("keypress", (e) => {
  if(e.keyCode == 13 && chatFormMessageInput.value.length > 0 && !chatFormMessage.classList.contains('load')){
    chatMessageSubmit();
  }
});

chatFormMessageBtn.addEventListener("click", () => {
    chatMessageSubmit();
});

function chatMessageSubmit(){
  chatMessages.insertAdjacentHTML('beforeend', `
    <div class="chatbot-message chatbot-message_user">
      <div class="chatbot-message__container">
          <div class="chatbot-message__avatar" style="background-image: url(img/avatar-user.png);"></div>
          <div class="chatbot-message__text">
              <p>${ chatFormMessageInput.value }</p>
          </div>
      </div>
    </div>
  `);

  chatAnswer();

  chatFormMessageInput.value = "";
  chatFormMessageBtn.classList.remove('active');
  chatFormMessageInput.focus();

}


/****** Chat Answer ******/
function chatAnswer(){

  let numTypeWrite = 0;
  let randomAnswer = Math.floor(Math.random() * botDB.answers.length);
  let textTypeWrite = botDB.answers[randomAnswer];

  chatMessages.insertAdjacentHTML('beforeend', `
  <div class="chatbot-message chatbot-message_bot">
    <div class="chatbot-message__container">
        <div class="chatbot-message__avatar" style="background-image: url(img/avatar-bot.png);"></div>
        <div class="chatbot-message__text bot-answer"><p></p></div>
    </div>
  </div>
  `);
  
  let botMessage = document.querySelectorAll('.bot-answer');
  let botMessageLast = botMessage[botMessage.length - 1];

 function typeWriter() {
    chatFormMessage.classList.add('load');

    if (numTypeWrite < textTypeWrite.length) {
      botMessageLast.querySelector('p').innerHTML +=  textTypeWrite.charAt(numTypeWrite)
      numTypeWrite++;
      setTimeout(typeWriter, speedTypeWrite);
    }

    if (numTypeWrite === textTypeWrite.length){
      chatFormMessage.classList.remove('load');
      chatMain.scrollTop = chatMain.scrollHeight;
    }

  }
 
  typeWriter();

  chatMain.scrollTop = chatMain.scrollHeight;
}
