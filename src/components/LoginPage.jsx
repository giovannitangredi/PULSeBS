import React, { useState } from "react";
import { Container, Form, Button,Alert } from "react-bootstrap";
import axios from 'axios'
export const LoginPage = (props) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error,setError] = useState(false);
    const onChangeEmail= (ev) =>{
        setEmail(ev.target.value)
    }
    const onChangePassword= (ev )=>{
        setPassword(ev.target.value)
    }
    const onSubmit = (e) => {
        e.preventDefault()
        axios.post('/auth/login', { email, password }).then(res => {
            if(res.data.id)
            {
                setError(false);
                props.login(res.data)  
            }
            else
                setError(true);

        })
    }
    return <Container>
        
        <h1>Login</h1>
        {error && <Alert variant="warning"> You have inserted Wrong Credentials! Please try again</Alert>}
        <Form method='post' onSubmit={(e) => { onSubmit(e) }}>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email"  value={email} onChange={(ev)=> onChangeEmail(ev)}/>
                <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password"  value={password} onChange={(ev)=> onChangePassword(ev)}/>
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    </Container>
}