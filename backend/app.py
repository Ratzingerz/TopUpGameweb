import os
import uuid
import jwt
import datetime
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Konfigurasi Database & Upload
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'mysql+pymysql://root:admin@localhost/mytopup_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'kunci-rahasia-default-buat-dev'
app.config['UPLOAD_FOLDER'] = 'uploads'

# Buat folder uploads jika belum ada
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# ==========================================
# MODEL DATABASE
# ==========================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), default='user') # 'user' atau 'admin'

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    image_url = db.Column(db.String(255))
    account_fields = db.Column(db.String(255), default='User ID') # <--- Format dinamis kolom form
    products = db.relationship('Product', backref='game', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255))

class PaymentMethod(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, nullable=True) # Jika null, berlaku semua game
    name = db.Column(db.String(50), nullable=False)
    fee = db.Column(db.Float, default=0)

class Promo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount = db.Column(db.Float, default=0)
    min_spend = db.Column(db.Float, default=0)
    is_active = db.Column(db.Boolean, default=True)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, nullable=True)
    account_data = db.Column(db.Text, nullable=False) # <--- Menyimpan gabungan input dinamis
    contact = db.Column(db.String(50), nullable=False)
    qty = db.Column(db.Integer, default=1)
    game_name = db.Column(db.String(100)) 
    product_name = db.Column(db.String(100))
    payment_method = db.Column(db.String(50))
    total_price = db.Column(db.Float, nullable=False)
    
    payment_status = db.Column(db.String(20), default='UNPAID') 
    order_status = db.Column(db.String(20), default='PENDING')  
    
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


# ==========================================
# MIDDLEWARE AUTENTIKASI (JWT)
# ==========================================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token hilang!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token tidak valid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


# ==========================================
# STATIC FILES (GAMBAR UPLOAD)
# ==========================================
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ==========================================
# API PUBLIK & USER
# ==========================================
@app.route('/api/games', methods=['GET'])
def get_games():
    games = Game.query.all()
    data = []
    for g in games:
        prods = [{'id': p.id, 'name': p.name, 'price': p.price, 'image_url': p.image_url} for p in g.products]
        data.append({
            'id': g.id, 
            'name': g.name, 
            'slug': g.slug, 
            'image_url': g.image_url, 
            'account_fields': g.account_fields, # <--- Mengirim aturan field ke frontend
            'products': prods
        })
    return jsonify({'data': data})

@app.route('/api/games/<slug>', methods=['GET'])
def get_game_detail(slug):
    game = Game.query.filter_by(slug=slug).first_or_404()
    prods = [{'id': p.id, 'name': p.name, 'price': p.price, 'image_url': p.image_url} for p in game.products]
    payments = PaymentMethod.query.filter((PaymentMethod.game_id == None) | (PaymentMethod.game_id == game.id)).all()
    pays = [{'id': pm.id, 'name': pm.name, 'fee': pm.fee} for pm in payments]
    
    return jsonify({
        'data': {
            'game': {
                'id': game.id, 
                'name': game.name, 
                'slug': game.slug, 
                'image_url': game.image_url, 
                'account_fields': game.account_fields # <--- Mengirim aturan field ke frontend
            },
            'products': prods,
            'payments': pays
        }
    })

@app.route('/api/check-promo', methods=['POST'])
def check_promo():
    data = request.json
    promo = Promo.query.filter_by(code=data['code'], is_active=True).first()
    if not promo:
        return jsonify({'message': 'Kode promo tidak valid atau kadaluarsa'}), 400
    if float(data['subtotal']) < promo.min_spend:
        return jsonify({'message': f'Minimal belanja Rp {promo.min_spend}'}), 400
    return jsonify({'discount': promo.discount})

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    user_id = None
    if 'Authorization' in request.headers:
        token = request.headers['Authorization'].split(" ")[1]
        try:
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = decoded['user_id']
        except:
            pass 
            
    date_str = datetime.datetime.now().strftime("%Y%m%d")
    count_today = Transaction.query.filter(Transaction.invoice.like(f"#TOP-{date_str}-%")).count() + 1
    invoice = f"#TOP-{date_str}-{count_today:03d}"
    
    trx = Transaction(
        invoice=invoice, 
        user_id=user_id, 
        account_data=data['account_data'], # <--- Menyimpan string dinamis dari frontend
        contact=data['contact'], 
        qty=data['qty'], 
        game_name=data['game_name'], 
        product_name=data['product_name'],
        payment_method=data['payment_method'], 
        total_price=data['total_price'],
        payment_status='UNPAID', 
        order_status='PENDING'
    )
    db.session.add(trx)
    db.session.commit()
    return jsonify({'invoice': invoice})


# ==========================================
# API AUTENTIKASI
# ==========================================
@app.route('/api/user/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username sudah terpakai'}), 400
    hashed_pw = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password_hash=hashed_pw, role='user')
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Registrasi sukses'})

@app.route('/api/user/login', methods=['POST'])
def user_login():
    data = request.json
    user = User.query.filter_by(username=data['username'], role='user').first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Username atau password user salah'}), 401
    
    token = jwt.encode({'user_id': user.id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'])
    return jsonify({'token': token, 'username': user.username})

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    user = User.query.filter_by(username=data['username'], role='admin').first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Akses Ditolak: Bukan Admin'}), 401
        
    token = jwt.encode({'user_id': user.id, 'role': 'admin', 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'])
    return jsonify({'token': token})


@app.route('/api/user/transactions', methods=['GET'])
@token_required
def get_user_transactions(current_user):
    trx = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.id.desc()).all()
    res = [{
        'invoice': t.invoice, 
        'product_name': t.product_name, 
        'qty': t.qty, 
        'account_data': t.account_data, # <--- Mengirim data akun dinamis
        'payment_method': t.payment_method, 
        'total_price': t.total_price, 
        'payment_status': t.payment_status,
        'order_status': t.order_status
    } for t in trx]
    return jsonify({'data': res})


# ==========================================
# API ADMIN (CRUD)
# ==========================================
def save_image(file):
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return f"http://127.0.0.1:5000/uploads/{filename}"
    return None

@app.route('/api/admin/games', methods=['POST'])
def admin_add_game():
    name = request.form.get('name')
    slug = request.form.get('slug')
    account_fields = request.form.get('account_fields', 'User ID') # <--- Tangkap input kolom form admin
    img_url = save_image(request.files.get('image'))
    
    db.session.add(Game(name=name, slug=slug, image_url=img_url, account_fields=account_fields))
    db.session.commit()
    return jsonify({'message': 'Game ditambahkan'})

@app.route('/api/admin/games/<int:id>', methods=['PUT'])
def admin_edit_game(id):
    game = Game.query.get(id)
    game.name = request.form.get('name')
    game.slug = request.form.get('slug')
    game.account_fields = request.form.get('account_fields', 'User ID') # <--- Update kolom form admin
    
    img_url = save_image(request.files.get('image'))
    if img_url: 
        game.image_url = img_url
        
    db.session.commit()
    return jsonify({'message': 'Game diupdate'})

@app.route('/api/admin/products', methods=['POST'])
def admin_add_product():
    game_id, name, price = request.form.get('game_id'), request.form.get('name'), request.form.get('price')
    img_url = save_image(request.files.get('image'))
    db.session.add(Product(game_id=game_id, name=name, price=price, image_url=img_url))
    db.session.commit()
    return jsonify({'message': 'Item ditambahkan'})

@app.route('/api/admin/products/<int:id>', methods=['PUT'])
def admin_edit_product(id):
    prod = Product.query.get(id)
    prod.game_id, prod.name, prod.price = request.form.get('game_id'), request.form.get('name'), request.form.get('price')
    img_url = save_image(request.files.get('image'))
    if img_url: prod.image_url = img_url
    db.session.commit()
    return jsonify({'message': 'Item diupdate'})

@app.route('/api/admin/promos', methods=['GET', 'POST'])
def admin_promos():
    if request.method == 'GET':
        promos = Promo.query.all()
        return jsonify({'data': [{'id': p.id, 'code': p.code, 'discount': p.discount, 'min_spend': p.min_spend, 'is_active': p.is_active} for p in promos]})
    data = request.json
    db.session.add(Promo(code=data['code'], discount=data['discount'], min_spend=data.get('min_spend', 0), is_active=data.get('is_active', True)))
    db.session.commit()
    return jsonify({'message': 'Promo dibuat'})

@app.route('/api/admin/promos/<int:id>', methods=['PUT', 'DELETE'])
def admin_promo_detail(id):
    promo = Promo.query.get(id)
    if request.method == 'DELETE':
        db.session.delete(promo)
    else:
        data = request.json
        promo.code, promo.discount, promo.min_spend, promo.is_active = data['code'], data['discount'], data['min_spend'], data['is_active']
    db.session.commit()
    return jsonify({'message': 'Sukses'})

@app.route('/api/admin/payments', methods=['GET', 'POST'])
def admin_payments():
    if request.method == 'GET':
        payments = PaymentMethod.query.all()
        data = []
        for p in payments:
            game_name = Game.query.get(p.game_id).name if p.game_id else "Semua Game"
            data.append({'id': p.id, 'name': p.name, 'fee': p.fee, 'game_name': game_name})
        return jsonify({'data': data})
    data = request.json
    game_id = data.get('game_id')
    db.session.add(PaymentMethod(game_id=game_id if game_id else None, name=data['name'], fee=data['fee']))
    db.session.commit()
    return jsonify({'message': 'Pembayaran dibuat'})

@app.route('/api/admin/payments/<int:id>', methods=['DELETE'])
def admin_delete_payment(id):
    db.session.delete(PaymentMethod.query.get(id))
    db.session.commit()
    return jsonify({'message': 'Dihapus'})

@app.route('/api/admin/transactions', methods=['GET'])
def admin_get_transactions():
    trx = Transaction.query.order_by(Transaction.id.desc()).all()
    data = [{
        'id': t.id, 
        'invoice': t.invoice, 
        'game_name': t.game_name,
        'product_name': t.product_name, 
        'account_data': t.account_data,
        'contact': t.contact, # <--- Tambahan untuk melihat No WA pembeli
        'total_price': t.total_price, 
        'payment_method': t.payment_method,
        'payment_status': t.payment_status, 
        'order_status': t.order_status,
        # Format tanggal menjadi string agar bisa dihitung di React
        'created_at': t.created_at.strftime("%Y-%m-%d %H:%M:%S") if t.created_at else "" 
    } for t in trx]
    return jsonify({'data': data})

@app.route('/api/admin/transactions/<int:id>/status', methods=['PUT'])
def admin_update_order_status(id):
    trx = Transaction.query.get(id)
    new_status = request.json.get('order_status')
    if new_status in ['SUCCESS', 'FAILED']:
        trx.order_status = new_status
        db.session.commit()
        return jsonify({'message': 'Status berhasil diubah'})
    return jsonify({'message': 'Status tidak valid'}), 400

# ==========================================
# API SIMULASI PEMBAYARAN & INVOICE
# ==========================================
@app.route('/api/invoice/<path:invoice_id>', methods=['GET'])
def get_invoice_detail(invoice_id):
    trx = Transaction.query.filter_by(invoice=invoice_id).first()
    if not trx:
        return jsonify({'message': 'Invoice tidak ditemukan'}), 404
    
    return jsonify({
        'data': {
            'invoice': trx.invoice, 
            'game_name': trx.game_name, 
            'product_name': trx.product_name,
            'account_data': trx.account_data, # <--- Mengirim data akun dinamis
            'payment_method': trx.payment_method, 
            'total_price': trx.total_price,
            'payment_status': trx.payment_status, 
            'order_status': trx.order_status
        }
    })

@app.route('/api/checkout/<path:invoice>/pay', methods=['POST'])
def simulate_payment(invoice):
    trx = Transaction.query.filter_by(invoice=invoice).first()
    if not trx:
        return jsonify({'message': 'Invoice tidak ditemukan'}), 404
    if trx.payment_status != 'UNPAID':
        return jsonify({'message': 'Transaksi sudah diproses'}), 400
        
    trx.payment_status = 'PAID'
    trx.order_status = 'PROCESSING' 
    db.session.commit()
    return jsonify({'message': 'Pembayaran Berhasil'})

@app.route('/api/checkout/<path:invoice>/expire', methods=['POST'])
def expire_payment(invoice):
    trx = Transaction.query.filter_by(invoice=invoice).first()
    if trx and trx.payment_status == 'UNPAID':
        trx.payment_status = 'EXPIRED'
        trx.order_status = 'FAILED'
        db.session.commit()
    return jsonify({'message': 'Kadaluarsa'})


# ==========================================
# SETUP AWAL (JALANKAN SEKALI)
# ==========================================
def setup_database():
    with app.app_context():
        # Karena kita mengubah struktur kolom, nyalakan db.drop_all() sekali ini saja, lalu matikan lagi di run berikutnya
        db.drop_all() 
        db.create_all()
        
        # Buat akun admin default
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', password_hash=generate_password_hash('admin123'), role='admin')
            db.session.add(admin)
            db.session.commit()

if __name__ == '__main__':
    setup_database()
    app.run(debug=True, port=5000)