from flask import Flask, request, jsonify
from app.services.summarization_service import SummarizationService

app = Flask(__name__)

@app.route('/')
# ‘/’ URL is bound with hello_world() function.
def hello_world():
    return jsonify({
        'status': 'success',
        'message': 'Hello from Scrollpedia Summarization!'
    })

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'success',
        'message': 'Pong!'
    })

@app.route('/summarize', methods=['POST'])
def summarize():
    reqBody = request.get_json()
    print("reqBody", reqBody)
    if not reqBody or not reqBody.get('article_id') or not reqBody.get('article_title') or not reqBody.get('article_description'):
        return jsonify({
            'status': 'error',
            'message': 'Invalid request',
            'error': 'Missing required fields'
        }), 400

    article_id = reqBody.get('article_id')
    article_title = reqBody.get('article_title')
    article_description = reqBody.get('article_description')
    # Here you would call your summarization logic and return the result
    # For now, let's just return the received data as a placeholder
    audio_file_data = SummarizationService().summarize(article_data={
        'article_id': article_id,
        'article_title': article_title,
        'article_description': article_description
    })
    if audio_file_data is None:
        return jsonify({
            'status': 'error',
            'message': 'Summarization failed',
            'error': 'Failed to generate summary'
        }), 500

    if audio_file_data:
        return jsonify({
            'status': 'success',
            'message': 'Summarization successful',
            'data': {
                'article_id': article_id,
                'audio_data': audio_file_data
            }
        })
    else:
        return jsonify({
            'status': 'error',
            'message': 'Summarization failed',
            'error': 'Failed to generate summary'
        }), 500


# main driver function
if __name__ == '__main__':

    # run() method of Flask class runs the application 
    # on the local development server.
    app.run(debug=True)
