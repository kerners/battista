import Head from 'next/head'
import { useState  } from 'react'
import * as timeago from "timeago.js"
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react"
//import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.css";

import { useChannel } from '@ably-labs/react-hooks'
import { Types } from "ably"

type ConversationEntry = {
  message: string
  speaker: "bot" | "user"
  date: Date
  id?: string
}

  const updateChatbotMessage = (
    conversation: ConversationEntry[],
    message: Types.Message
  ): ConversationEntry[] => {
    const interactionId = message.data.interactionId;
  
    const updatedConversation = conversation.reduce(
      (acc: ConversationEntry[], e: ConversationEntry) => [
        ...acc,
        e.id === interactionId
          ? { ...e, message: e.message + message.data.token }
          : e,
      ],
      []
    );
  
    return conversation.some((e) => e.id === interactionId)
      ? updatedConversation
      : [
          ...updatedConversation,
          {
            id: interactionId,
            message: message.data.token,
            speaker: "bot",
            date: new Date(),
          },
        ];
  };

export default function Home() {
  const [ text, setText ] = useState("")
  const [ conversation, setConversation] = useState<ConversationEntry[]>([])
  const [ botIsTyping, setBotIsTyping] = useState<boolean>(false)
  const [ statusMessage, setStatusMessage] = useState<string>("Attende una tua domanda...")
  const [ source, setSource] = useState<boolean>(false)
  const [ streaming, setStreaming] = useState<boolean>(true)
  const [ userId, setUserId] = useState<string>("")

   useChannel(userId || 'default', (message) => {
    switch(message.data.event) {
      case "response": 
        setConversation((state) => updateChatbotMessage(state, message))
        break
      case "status":
        setStatusMessage(message.data.message)
        break
      case "responseEnd":
      default:
        setBotIsTyping(false)
        setStatusMessage("Attente una tua domanda...")
    }
  })

  const submit = async () => {
    if(!userId) {
       alert("Inserisci un nome utente unico mai usato prima")
       return
    }

    setConversation((state) => [
      ... state, {
        message: text,
        speaker: "user",
        date: new Date()
      }
    ])

    try {
      setBotIsTyping(true)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: text, userId, source, streaming })
      })

      await response.json()
      console.log('responded');
    } catch(error) {
      console.error("Error submitting message:", error)
    } finally {
      setBotIsTyping(false)
    }
    setText("")
  }

  return (
    <>
      <Head>
        <title>ChatBot</title>
        <meta name="description" content="Battista estetista" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link rel="stylesheet" href="/csss.css" />
        <link rel="stylesheet" href="/chat.css" />
      </Head>


      <main className="chatbot-page">

        <div className="chatbot-sidebar">
            <div className="chatbot-head">
                <button id="newChatBtn" className="chatbot-btn-newchat">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 6.85714H6.85714V12H5.14286V6.85714H0V5.14286H5.14286V0H6.85714V5.14286H12V6.85714Z" fill="white"/>
                    </svg>
                    Nuova chiacchierata
                </button>
            </div>
            <div className="chatbot-history">

                <div className="chatbot-history__item">
                    <div className="chatbot-history__date">Luglio</div>

                    <div className="chatbot-history__link active">
                        <svg className="icon icon-message"><use href="#icon-message"></use></svg>
                        <div className="chatbot-history__title">Lorem Ipsum available</div>
                        <input className="chatbot-history__input" value="Lorem Ipsum available"></input>
                        <div className="chatbot-history__btns">
                            <button className="chatbot-history__btn chatbot-history__btn_edit">
                                <svg className="icon icon-chatbot-edit"><use href="#icon-chatbot-edit"></use></svg> 
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_delete">
                                <svg className="icon icon-chatbot-delete"><use href="#icon-chatbot-delete"></use></svg>
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_confirm">
                                <svg className="icon icon-chatbot-confirm"><use href="#icon-chatbot-confirm"></use></svg> 
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_cancel">
                                <svg className="icon icon-chatbot-cancel"><use href="#icon-chatbot-cancel"></use></svg>
                            </button>
                        </div>
                    </div>

                    <div className="chatbot-history__link">
                        <svg className="icon icon-message"><use href="#icon-message"></use></svg>
                        <div className="chatbot-history__title">Lorem Ipsum available</div>
                        <input className="chatbot-history__input" value="Lorem Ipsum available"></input>
                        <div className="chatbot-history__btns">
                            <button className="chatbot-history__btn chatbot-history__btn_edit">
                                <svg className="icon icon-chatbot-edit"><use href="#icon-chatbot-edit"></use></svg> 
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_delete">
                                <svg className="icon icon-chatbot-delete"><use href="#icon-chatbot-delete"></use></svg>
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_confirm">
                                <svg className="icon icon-chatbot-confirm"><use href="#icon-chatbot-confirm"></use></svg> 
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_cancel">
                                <svg className="icon icon-chatbot-cancel"><use href="#icon-chatbot-cancel"></use></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="chatbot-history__item">
                    <div className="chatbot-history__date">Giugno</div>

                    <div className="chatbot-history__link">
                        <svg className="icon icon-message"><use href="#icon-message"></use></svg>
                        <div className="chatbot-history__title">Lorem Ipsum available</div>
                        <input className="chatbot-history__input" value="Lorem Ipsum available"></input>
                        <div className="chatbot-history__btns">
                            <button className="chatbot-history__btn chatbot-history__btn_edit">
                                <svg className="icon icon-chatbot-edit"><use href="#icon-chatbot-edit"></use></svg> 
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_delete">
                                <svg className="icon icon-chatbot-delete"><use href="#icon-chatbot-delete"></use></svg>
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_confirm">
                                <svg className="icon icon-chatbot-confirm"><use href="#icon-chatbot-confirm"></use></svg> 
                            </button>
                            <button className="chatbot-history__btn chatbot-history__btn_cancel">
                                <svg className="icon icon-chatbot-cancel"><use href="#icon-chatbot-cancel"></use></svg>
                            </button>
                        </div>
                    </div>
                </div>
            
            </div>
            <div className="chatbot-footer">
                <a href="#" className="chatbot-btn-back">
                    <svg className="icon icon-caret-left"><use href="#icon-caret-left"></use></svg> 
                    Torna a Confestetica
                </a>
            </div>
        </div>

        <MainContainer>
          <ChatContainer>
              <MessageList
                   typingIndicator={
                    botIsTyping ? (
                      <TypingIndicator content="sto pensando..." />
                    ) : null
                   }
                 >
                  { 
                   conversation.map((entry, index) => {
                    return (
                      <Message
                        key={index}
                        style={{ width: "90%" }}
                        model={{
                          type: "custom",
                          sender: entry.speaker,
                          position: "single",
                          direction:
                            entry.speaker === "bot" ? "incoming" : "outgoing"
                        }}
                      >
                        <Message.CustomContent>
                        <span  dangerouslySetInnerHTML={{__html: entry.message}} />
                        </Message.CustomContent>
                        <Message.Footer
                           sentTime={timeago.format(entry.date)}
                           sender={entry.speaker === 'bot' ? "Battista": "Utente"}
                        />
                        </Message>
                    )
                   })
                  }
                 </MessageList>





                 <MessageInput
                    placeholder='Invia un messaggio'
                    onSend={submit}
                    onChange={(e, text) => {
                      setText(text)
                    }}
                    sendButton={true}
                    autoFocus
                    disabled={botIsTyping}
                    className="chatbot-form__input"
                 />

             </ChatContainer>
          </MainContainer>
https://chatscope.io/storybook/react/?path=/story/documentation-introduction--page

<input placeholder="username" type="text" value={userId} onChange={(e:any) => setUserId(e.target.value)}/>
                 




      {/*        <div style={{padding: "10px"}} style={{display: "none"}}>
          <input type="checkbox" id="streaming" name="streaming" checked={streaming} onChange={() => setStreaming(!streaming)} />
          <label htmlFor="streaming">Streaming (word by word)</label>
        </div>
        <div style={{padding: "10px"}} style={{display: "none"}}>
          <input type="checkbox" id="source" name="source" checked={source} onChange={() => setSource(!source)} />
          <label htmlFor="source">Show Sources</label>
        </div>
        <input type="text" value={userId} onChange={(e:any) => setUserId(e.target.value)}/> */}

      </main>
    </>
  )
}
