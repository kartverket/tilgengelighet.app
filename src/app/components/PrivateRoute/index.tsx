import React from "react";
import {Route, Redirect} from "react-router-dom";
import auth from 'auth'

interface PrivateRoute {
    component: React.FC<any>;
    authenticated: boolean;
    userLevel: boolean;
    args: any;
}

export default function PrivateRoute({
    component: Component,
    authenticated,
    userLevel,
    ...args
    }: any) {
    return (
        <Route
            {...args}
            render={(props) =>
                auth.isAuthenticated() ? (
                    auth.isAuthenticated() ? ( //change to userLevel ?
                        <Component {...props} {...args} />
                    ) : (
                        <Redirect to="/login" />
                    )
                ) : (
                    <Redirect to="/login" />
                )
            }
        />
    )
}
