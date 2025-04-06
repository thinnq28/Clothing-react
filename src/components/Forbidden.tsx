import React from 'react';

const ForbiddenPage = () => {
    return (
        <div className="container text-center my-5">
            <h1 className="display-1 text-danger">403</h1>
            <h2 className="mb-4">Forbidden</h2>
            <p className="mb-4">You do not have permission to access this page.</p>
            <a href={`/admin`} className="btn btn-primary">Go to Homepage</a>
        </div>
    );
};

export default ForbiddenPage;
