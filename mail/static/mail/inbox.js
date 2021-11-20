document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
 
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

 // Post Email 

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  console.log('senf');

  // Show the mailbox name
 
  const view = document.querySelector('#emails-view');
  view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {

    // generate div for each email
    emails.forEach(email => {
        let div = document.createElement('div');
        div.className = email['read'] ? "read" : "unread";
        div.innerHTML = `
            <span class="sender col-3"> <b>${email['sender']}</b> </span>
            <span class="subject col-6"> ${email['subject']} </span>
            <span class="timestamp col-3"> ${email['timestamp']} </span>
        `;
     
        // add listener and append to DOM
        div.addEventListener('click', () => load_email(email['id']));
        view.appendChild(div);
    });
  })
} 

function load_email(id){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  const getting=fetch('/emails/'+id)
  .then(response=>response.json())
  .then(email=>{
    document.querySelector('#email-view').innerHTML=`
    <ul>
    <li class="list-group-item"><b>From: ${email['sender']}</li>
    <li class="list-group-item"><b>To: ${email['recipients']}</li>
    <li class="list-group-item"><b>Subject:</b> <span>${email['subject']}</span</li>
    <li class="list-group-item"><b>Time:</b> <span>${email['timestamp']}</span></li>
  </ul>   
  <p class="m-2">${email['body']}</p> 
  <button class="btn btn-sm btn-outline-primary" id ="btn-archived">Archived</button>

  <button class="btn btn-sm btn-outline-primary" id ="btn-replay">Replay</button>

  <button class="btn btn-sm btn-outline-primary" id ="btn-unread">As unread</button>
    `
    // Archiving the Email
   const archived= document.querySelector('#btn-archived');
   archived.innerHTML=!email['archived'] ? 'Archive' : 'Unarchive';
   archived. addEventListener('click',()=>{ 
      fetch( '/emails/'+id,{
        method:'Put',
        body: JSON.stringify({ archived : !email['archived'] })
         })
        });  


 const unread= document.querySelector('#btn-unread');

  unread. addEventListener('click',()=>{ 
      fetch( '/emails/'+id,{
        method:'Put',
        body: JSON.stringify({ read: false })
         })
        });


        
        

  // Replay to email Sender

  const replay= document.querySelector('#btn-replay');
  replay.addEventListener('click',()=>{
    compose_email();
    document.querySelector('#compose-recipients').value = email['sender'];
    let subject = email['subject'];
    console.log(subject.split(" ", 1)[0]);
    if (subject.split(" ", 1)[0] != "Re:") {
      subject = "Re: " + subject;
    }
    document.querySelector('#compose-subject').value = subject;

    let body = `
      On ${email['timestamp']}, ${email['sender']} wrote: ${email['body']}
    `;
    document.querySelector('#compose-body').value = body;


  });
 if(!email['read']){
  fetch( '/emails/'+id,{
    method:'Put',
    body: JSON.stringify({ read : true})
     })

 }     });
}

function send_email(){
  let recipients = document.getElementById('compose-recipients').value;
  let subject = document.getElementById('compose-subject').value;
  let body = document.getElementById('compose-body').value;
  console.log(recipients,subject,body);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    if ("message" in result) {
      // The email was sent successfully!
      load_mailbox('sent');
  }

  if ("error" in result) {
      // There was an error in sending the email
      // Display the error next to the "To:"
      document.querySelector('#to-text-error-message').innerHTML = result['error']

  }
  })
  .catch(error => {
    // we hope this code is never executed, but who knows?
    console.log(error);
});
return false;

} 


