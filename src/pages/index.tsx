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
        <link rel="stylesheet" href="/css.css" />
      </Head>
      <main className="cs-main-container">
      <div style={{display: "flex"}}>
        <div style={{padding: "10px"}} style={{display: "none"}}>
          <input type="checkbox" id="streaming" name="streaming" checked={streaming} onChange={() => setStreaming(!streaming)} />
          <label htmlFor="streaming">Streaming (word by word)</label>
        </div>
        <div style={{padding: "10px"}} style={{display: "none"}}>
          <input type="checkbox" id="source" name="source" checked={source} onChange={() => setSource(!source)} />
          <label htmlFor="source">Show Sources</label>
        </div>
        <div style={{padding: "6px"}}>
          Nome utente <input type="text" value={userId} onChange={(e:any) => setUserId(e.target.value)}  style={{padding: "6px"}}/>
        </div>
      </div>
      <div style={{ position: "relative", height: "92vh", overflow: "hidden", width: "100%" }}>
          <MainContainer>
             <ChatContainer>
                <ConversationHeader>
                  <ConversationHeader.Actions></ConversationHeader.Actions>
                  <ConversationHeader.Content
                     userName="Battista"
                     info={statusMessage}
                  />
                </ConversationHeader>
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
                 />
             </ChatContainer>
          </MainContainer>
        </div>
      </main>
    </>
  )
}
