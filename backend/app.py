from flask import Flask, request, jsonify, render_template, redirect, url_for, session, make_response
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import io
import os
import jwt
import datetime
import logging

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base
from flask_cors import CORS  # Add this import

app = Flask(__name__)  # Fix: change _name to _name_
CORS(app, supports_credentials=True)  # Add this line

app.config['SECRET_KEY'] = 'your_secret_key'
base_dir = r'C:/Users/amans/Downloads/App/backend'
os.chdir(base_dir)

app.config['SQLALCHEMY_DATABASE_URI'] = r'sqlite:///C:/Users/amans/Downloads/App/backend/Category.db'
app.config['SQLALCHEMY_BINDS'] = {
    'users': r'sqlite:///C:/Users/amans/Downloads/App/backend/users.db',
    'countryprofile': r'sqlite:///C:/Users/amans/Downloads/App/backend/countryprofile.db'
}
app.config['UPLOAD_FOLDER'] = r'C:\Users\amans\Downloads\App\backend\uploads'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

Base = declarative_base()

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token

class User(db.Model):
    bind_key = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(255), nullable=False)
    subcategory = db.Column(db.String(255), nullable=False)
    referral_fee = db.Column(db.Float, nullable=False)

class CountryProfile(Base):
    __tablename__ = 'country_profile'
    bind_key = 'countryprofile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    country = db.Column(db.String(255), nullable=False)
    marketplace = db.Column(db.String(255), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    sku = db.Column(db.String(255), nullable=False)
    fnsku = db.Column(db.String(255), nullable=False)
    asin = db.Column(db.String(255), nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    brand = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    estimated_fees = db.Column(db.Float, nullable=False)

def create_user_database(user_db_path):
    user_engine = create_engine(f'sqlite:///{user_db_path}')
    Base.metadata.bind = user_engine
    Base.metadata.create_all(user_engine)
    UserSession = sessionmaker(bind=user_engine)
    user_session = UserSession()
    return user_session

def create_tables():
    with app.app_context():
        db.create_all()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Username already exists. Please choose a different username.'})
    else:
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        session['user_id'] = new_user.id
        token = generate_token(new_user.id)

        return jsonify({'success': True, 'message': 'User registered successfully', 'token':token})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if data is None:
        return jsonify({'success': False, 'message': 'Invalid input'}), 400

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id
        print("here it isssssss ",session['user_id'])
        token = generate_token(user.id)
        return jsonify({'success': True, 'message': 'Valid username and password', 'token': token})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/login', methods=['GET'])
def login_page():
    return 'Render your login page here'

@app.route('/', methods=['GET'])
def index():
    return redirect(url_for('register'))

@app.route('/userprofile', methods=['POST'])
def userprofile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization token is missing or invalid'}), 401

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    country = request.form.get('country')
    marketplace = request.form.get('marketplace')
    file = request.files.get('file')

    if not country or not marketplace or not file:
        return jsonify({'error': 'Country, marketplace, and file are required'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    print(f"File received: {file.filename}")
    print(f"File path: {file_path}")
    try:
        file.save(file_path)
        print(f"File saved successfully at: {file_path}")

        # Read the Excel file using pandas
        df = pd.read_excel(file_path)
    except Exception as e:
        logging.error(f"Error reading Excel file: {e}")
        return jsonify({'error': 'Error reading Excel file'}), 500

    # Create user-specific database session
    user_db_path = os.path.join(base_dir, f'user_{user_id}.db')
    user_session = create_user_database(user_db_path)

    try:
        # Iterate over the rows and save data to the database
        for _, row in df.iterrows():
            
            fnsku = row['FNSKU'] if pd.notna(row['FNSKU']) else ''
            
            new_entry = CountryProfile(
        user_id=user_id,
        country=country,
        marketplace=marketplace,
        file_name=filename,
        sku=row['SKU'],
        fnsku=fnsku,  # Handle 'nan' values here
        asin=row['ASIN'],
        product_name=row['Product Name'],
        brand=row['Brand'],
        price=row['Price'],
        estimated_fees=row['Estimated fees']
            )
            user_session.add(new_entry)
        user_session.commit()
    except Exception as e:
        logging.error(f"Error saving to database: {e}")
        user_session.rollback()  # Rollback the session in case of error
        return jsonify({'error': f'Error saving to database: {e}'}), 500

    finally:
        user_session.close()
        if os.path.exists(file_path):
            os.remove(file_path)  # Remove the file after processing

    return jsonify({'message': 'File successfully uploaded and data added to the database.'})

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization token is missing or invalid'}), 401

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    user = User.query.get(user_id)

    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400

    file = request.files['file']
    country = request.form['country']
    category = request.form['category']
    subcategory = request.form['subcategory']
    
    user.country = country
    user.category = category
    user.subcategory = subcategory
    db.session.commit()

    if file and file.filename != '':
        try:
            df = pd.read_excel(file)
            referral_fee = get_referral_fee(country, category, subcategory)

            if referral_fee is not None:
                df_modified = apply_modifications(df, referral_fee)
                excel_output = io.BytesIO()
                df_modified.to_excel(excel_output, index=False)
                excel_output.seek(0)

                response = make_response(excel_output.getvalue())
                response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                response.headers['Content-Disposition'] = 'attachment; filename=myoutput.xlsx'
                print("no issuessssss")
                return response
            else:
                return jsonify({'success': False, 'message': 'Referral fee not found for the selected country, category, and subcategory.'}), 400
        except Exception as e:
            print("Error:", e)
            return jsonify({'success': False, 'message': 'An error occurred while processing your request.'}), 500
    else:
        return jsonify({'success': False, 'message': 'No file selected. Please select a file.'}), 400

def get_referral_fee(country, category, subcategory):
    country_upper = country.upper()
    category_upper = category.upper()
    subcategory_upper = subcategory.upper()
    category_obj = Category.query.filter_by(country=country_upper, category=category_upper, subcategory=subcategory_upper).first()
    if category_obj:
        return category_obj.referral_fee
    else:
        return None

def apply_modifications(df, referral_fee):
    try:
        for index, row in df.iterrows():
            s = row['selling fees']
            t = row['product sales']
            c = row['postage credits']
            m = row['promotional rebates']
            n = row['gift wrap credits']
            f = row['fba fees']
            d = t + c + m
            fp = t + c + m + n

            if d != 0:
                ans = (-s / d) * 100
                if ans < referral_fee or ans > referral_fee:
                    df.at[index, 'ErrorStatus'] = 'error'
                else:
                    df.at[index, 'ErrorStatus'] = 'OK'
            else:
                df.at[index, 'ErrorStatus'] = 'DivideByZeroError'
            df.at[index, 'Answer'] = ans if d != 0 else 0

            if fp != 0:
                fpans = (f / fp) * 100
                if fpans < referral_fee or fpans > referral_fee:
                    df.at[index, 'FbaErrorStatus'] = 'error'
                else:
                    df.at[index, 'FbaErrorStatus'] = 'OK'
            else:
                df.at[index, 'FbaErrorStatus'] = 'DivideByZeroError'
            df.at[index, 'FbaAnswer'] = fpans if fp != 0 else 0

        return df
    except Exception as e:
        print("Error in apply_modifications:", e)
        return None



@app.route('/confirmation', methods=['GET'])
def confirmation():
    return jsonify({'message': 'You can display me'})

@app.route('/dashboard', methods=['GET'])
def get_userprofile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization token is missing or invalid'}), 401

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    print("no issuesfghfhjm,hghfdghm")
    profile = {
        'username': user.username,
        'marketplace': user.marketplace,
        'country': user.country
    }

    return jsonify(profile), 200



if __name__ == '_main_':
    create_tables()  # Create tables before running the app
    app.run(debug=True)