import React from 'react'

import ForgeUI, {
  Button,
  Text,
  useEffect,
  useState,
  Fragment,
  IssuePanel,
  render,
  useProductContext,
  Link,
} from '@forge/ui'

import api, { fetch, route, storage } from '@forge/api'

const sendLog = async () => Promise.resolve('send!')

const LogData = ({ counter }) => {
  const [logSend, setLogSend] = useState('👻')
  const [contentId, setContentId] = useState('👻')

  const fetchCommentsForContent = async (contentId) => {
    console.log(`issueKey: ${contentId.platformContext.issueKey}`)
    const response = await api
      .asApp()
      .requestJira(
        route`/rest/api/3/issue/${contentId.platformContext.issueKey}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )

    console.log(`Response: ${response.status} ${response.statusText}`)
    // console.log(await response.json());
    const data = await response.json()
    return data
  }

  const fetchPOSTcontent = async (json) => {
    const data = await postData('https://ipfs-proxy-server.muzamint.com/', json)
    JSON.stringify(data)
    setLogSend(data.ipfs_url)
    await storage.set('ipfs_url', logSend)
    return logSend
  }

  useEffect(async () => {
    await sendLog()
    setLogSend(Date.now())
    //   storage.set('ipfs_url', 'https://dweb.link/ipfs/bafkreiatd27bwnosak3gnshapaye352wpjwmbg2cro6t5emjgtjhqdcqvy');

    const context = useProductContext()
    console.log(context)
    setContentId(
      context === 'undefined'
        ? ' unknown '
        : context.platformContext.type +
            '-' +
            context.platformContext.issueKey +
            '(' +
            context.platformContext.issueType +
            ')',
    )
    // const data = await fetchCommentsForContent(context)
    //const json = JSON.stringify(data)
    // console.log('save_data: ', json)
    const ipfs_url = await storage.get('ipfs_url')
    setLogSend(ipfs_url)
  }, [])

  useEffect(async () => {
    console.log('counter',counter)
    if (counter > 0) {
      storage.delete('ipfs_url')

      const context = useProductContext()
      console.log(context)
      setContentId(
        context === 'undefined'
          ? ' unknown '
          : context.platformContext.type +
              '-' +
              context.platformContext.issueKey +
              '(' +
              context.platformContext.issueType +
              ')',
      )
      const data = await fetchCommentsForContent(context)
      const json = JSON.stringify(data)
      //console.log('save_data: ', json)
      const ipfs = await fetchPOSTcontent(json)
      console.log('ipfs: ', ipfs)
    }
  }, [counter])

  return (
    <Fragment>
      <Text>This issue: {contentId} </Text>
      <Text>had been backuped to IPFS as follow; </Text>
      <Text>URL: {logSend} </Text>
      <Text>
        <Link href={logSend}>{contentId}</Link> 🔗 click here to browse 💡
      </Text>
    </Fragment>
  )
}

const postData = async (url, data) => {
  // Default options are marked with *
  const res = await fetch(url, {
    body: data, // must match 'Content-Type' header
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    redirect: 'follow', // manual, *follow, error
  })
  return res.json()
}

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <Fragment>
      <Button
        text={`Backup`}
        onClick={() => {
          setCount(count + 1)
        }}
      />
      <LogData counter={count} />
    </Fragment>
  )
}

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>,
)
