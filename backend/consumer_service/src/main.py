from confluent_kafka import Consumer, KafkaError

def consume_messages(topics):
    consumer = Consumer({
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'mygroup',
        'auto.offset.reset': 'earliest'
    })

    consumer.subscribe(topics)

    while True:
        msg = consumer.poll(1.0)

        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                print(msg.error())
                break

        print(f'Received message: {msg.topic(): msg.value().decode("utf-8")}')

    consumer.close()

if __name__ == "__main__":
    topics = ["applications", "rejections", "approvals"]
    consume_messages(topics)