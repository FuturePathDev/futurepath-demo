const awsmobile = {
    aws_project_region: us-east-1,
    aws_cognito_identity_pool_id: us-east-1:0e8c9735-27e1-4dca-b98b-9d1a4bb65e8d, 
    aws_cognito_region: us-east-1,
    aws_user_pools_id: us-east-1_BBupLYXRS
    aws_user_pools_web_client_id: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // App Client ID here
    oauth: {},
    aws_cloud_logic_custom: [
        {
            name: FuturePathAPI,
            endpoint: https://h849e62b41.execute-api.us-east-1.amazonaws.com/dev
            region: us-east-1
        }
    ]
};

export default awsmobile;
