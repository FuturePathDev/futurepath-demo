{
    "FunctionName": "FPDemo-ListTutors",
    "FunctionArn": "arn:aws:lambda:us-east-1:327024256877:function:FPDemo-ListTutors",
    "Runtime": "nodejs18.x",
    "Role": "arn:aws:iam::327024256877:role/FPDemoLambdaRole",
    "Handler": "index.handler",
    "CodeSize": 472,
    "Description": "",
    "Timeout": 3,
    "MemorySize": 128,
    "LastModified": "2025-08-17T21:59:21.000+0000",
    "CodeSha256": "I9TqOqT51hjeE0gJn/vKSUudTZbfwjHsFmmb3hsJ9h8=",
    "Version": "$LATEST",
    "Environment": {
        "Variables": {
            "TUTORS_TABLE": "FuturePathTutors"
        }
    },
    "TracingConfig": {
        "Mode": "PassThrough"
    },
    "RevisionId": "8c0be0fb-05fa-42a7-bbc9-41f74e9d2fad",
    "State": "Active",
    "LastUpdateStatus": "InProgress",
    "LastUpdateStatusReason": "The function is being created.",
    "LastUpdateStatusReasonCode": "Creating",
    "PackageType": "Zip",
    "Architectures": [
        "x86_64"
    ],
    "EphemeralStorage": {
        "Size": 512
    },
    "SnapStart": {
        "ApplyOn": "None",
        "OptimizationStatus": "Off"
    },
    "RuntimeVersionConfig": {
        "RuntimeVersionArn": "arn:aws:lambda:us-east-1::runtime:eb463f0483e181b8fc1d514ec52ca261540b73dae25e5e0077f2656d17347da5"
    },
    "LoggingConfig": {
        "LogFormat": "Text",
        "LogGroup": "/aws/lambda/FPDemo-ListTutors"
    }
}
